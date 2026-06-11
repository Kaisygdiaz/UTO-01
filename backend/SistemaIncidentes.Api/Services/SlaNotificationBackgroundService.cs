using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using SistemaIncidentes.Api.Data;
using SistemaIncidentes.Api.Models;
using SistemaIncidentes.Api.Settings;

namespace SistemaIncidentes.Api.Services
{
    public class SlaNotificationBackgroundService : BackgroundService
    {
        private const string TipoAlertaProximoVencimiento = "ProximoVencimientoResolucion";
        private const string TipoAlertaVencido = "VencidoResolucion";

        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<SlaNotificationBackgroundService> _logger;
        private readonly SlaSettings _settingsFallback;

        public SlaNotificationBackgroundService(
            IServiceScopeFactory scopeFactory,
            ILogger<SlaNotificationBackgroundService> logger,
            IOptions<SlaSettings> options)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
            _settingsFallback = options.Value;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Servicio automático de alertas SLA iniciado.");

            while (!stoppingToken.IsCancellationRequested)
            {
                int intervaloRevisionMinutos = _settingsFallback.IntervaloRevisionMinutos <= 0
                    ? 1
                    : _settingsFallback.IntervaloRevisionMinutos;

                try
                {
                    intervaloRevisionMinutos = await EjecutarRevisionSlaAsync(stoppingToken);
                }
                catch (OperationCanceledException)
                {
                    _logger.LogInformation("Servicio automático de alertas SLA detenido.");
                    break;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error durante la revisión automática de alertas SLA.");
                }

                if (intervaloRevisionMinutos <= 0)
                {
                    intervaloRevisionMinutos = 1;
                }

                await Task.Delay(TimeSpan.FromMinutes(intervaloRevisionMinutos), stoppingToken);
            }
        }

        private async Task<int> EjecutarRevisionSlaAsync(CancellationToken cancellationToken)
        {
            using var scope = _scopeFactory.CreateScope();

            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();

            var configuracion = await ObtenerConfiguracionSlaAsync(context, cancellationToken);

            if (!configuracion.Habilitado)
            {
                _logger.LogInformation("El servicio automático de alertas SLA está deshabilitado desde configuración administrable.");
                return configuracion.IntervaloRevisionMinutos;
            }

            var fechaActual = DateTime.UtcNow;

            var tickets = await context.Tickets
                .Include(t => t.UsuarioSolicitante)
                .Include(t => t.TecnicoAsignado)
                .Include(t => t.EstadoTicket)
                .Include(t => t.Prioridad)
                .Where(t =>
                    t.Prioridad != null &&
                    t.EstadoTicket != null &&
                    (
                        t.EstadoTicket.Nombre == "Abierto" ||
                        t.EstadoTicket.Nombre == "En proceso" ||
                        t.EstadoTicket.Nombre == "Escalado"
                    ))
                .ToListAsync(cancellationToken);

            foreach (var ticket in tickets)
            {
                if (ticket.Prioridad == null || ticket.EstadoTicket == null)
                {
                    continue;
                }

                var fechaCreacion = NormalizarFechaUtc(ticket.FechaCreacion);
                var fechaLimiteResolucion = fechaCreacion.AddHours(ticket.Prioridad.TiempoResolucionHoras);

                var horasTotalesResolucion = ticket.Prioridad.TiempoResolucionHoras;
                var horasRestantesResolucion = (fechaLimiteResolucion - fechaActual).TotalHours;

                if (fechaActual > fechaLimiteResolucion)
                {
                    await ProcesarAlertaAsync(
                        context,
                        emailService,
                        ticket,
                        TipoAlertaVencido,
                        "Ticket vencido por SLA",
                        fechaLimiteResolucion,
                        horasRestantesResolucion,
                        cancellationToken);

                    continue;
                }

                var porcentajeRestante = horasRestantesResolucion * 100 / horasTotalesResolucion;

                if (porcentajeRestante <= configuracion.PorcentajeProximoVencimiento)
                {
                    await ProcesarAlertaAsync(
                        context,
                        emailService,
                        ticket,
                        TipoAlertaProximoVencimiento,
                        "Ticket próximo a vencer SLA",
                        fechaLimiteResolucion,
                        horasRestantesResolucion,
                        cancellationToken);
                }
            }

            return configuracion.IntervaloRevisionMinutos;
        }

        private async Task<ConfiguracionSla> ObtenerConfiguracionSlaAsync(
            ApplicationDbContext context,
            CancellationToken cancellationToken)
        {
            var configuracion = await context.ConfiguracionesSla.FirstOrDefaultAsync(cancellationToken);

            if (configuracion != null)
            {
                return configuracion;
            }

            configuracion = new ConfiguracionSla
            {
                Habilitado = _settingsFallback.Habilitado,
                IntervaloRevisionMinutos = _settingsFallback.IntervaloRevisionMinutos <= 0 ? 1 : _settingsFallback.IntervaloRevisionMinutos,
                PorcentajeProximoVencimiento = _settingsFallback.PorcentajeProximoVencimiento <= 0 ? 25 : _settingsFallback.PorcentajeProximoVencimiento,
                FechaCreacion = DateTime.UtcNow
            };

            context.ConfiguracionesSla.Add(configuracion);
            await context.SaveChangesAsync(cancellationToken);

            return configuracion;
        }

        private async Task ProcesarAlertaAsync(
            ApplicationDbContext context,
            IEmailService emailService,
            Ticket ticket,
            string tipoAlerta,
            string asuntoBase,
            DateTime fechaLimiteResolucion,
            double horasRestantesResolucion,
            CancellationToken cancellationToken)
        {
            var destinatarios = await ObtenerDestinatariosAsync(context, ticket, cancellationToken);

            foreach (var destinatario in destinatarios)
            {
                bool yaNotificado = await context.NotificacionesSla.AnyAsync(n =>
                    n.TicketId == ticket.Id &&
                    n.TipoAlerta == tipoAlerta &&
                    n.DestinatarioCorreo == destinatario.Correo,
                    cancellationToken);

                if (yaNotificado)
                {
                    continue;
                }

                string asunto = $"{asuntoBase} - Ticket #{ticket.Id}";

                string contenido = CrearCorreoAlertaSla(
                    destinatario.NombreCompleto,
                    ticket,
                    tipoAlerta,
                    fechaLimiteResolucion,
                    horasRestantesResolucion);

                try
                {
                    await emailService.EnviarCorreoAsync(destinatario.Correo, asunto, contenido);

                    var notificacion = new NotificacionSla
                    {
                        TicketId = ticket.Id,
                        TipoAlerta = tipoAlerta,
                        DestinatarioCorreo = destinatario.Correo,
                        DestinatarioNombre = destinatario.NombreCompleto,
                        FechaEnvio = DateTime.UtcNow
                    };

                    await context.NotificacionesSla.AddAsync(notificacion, cancellationToken);
                    await context.SaveChangesAsync(cancellationToken);

                    _logger.LogInformation(
                        "Alerta SLA enviada. Ticket: {TicketId}, Tipo: {TipoAlerta}, Destinatario: {Correo}",
                        ticket.Id,
                        tipoAlerta,
                        destinatario.Correo);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(
                        ex,
                        "No se pudo enviar alerta SLA. Ticket: {TicketId}, Tipo: {TipoAlerta}, Destinatario: {Correo}",
                        ticket.Id,
                        tipoAlerta,
                        destinatario.Correo);
                }
            }
        }

        private static async Task<List<Usuario>> ObtenerDestinatariosAsync(
            ApplicationDbContext context,
            Ticket ticket,
            CancellationToken cancellationToken)
        {
            var destinatarios = new List<Usuario>();

            var responsables = await context.Usuarios
                .Include(u => u.Rol)
                .Where(u =>
                    u.Activo &&
                    u.EmailConfirmado &&
                    u.Rol != null &&
                    (
                        u.Rol.Nombre == "Administrador" ||
                        u.Rol.Nombre == "Jefe DTI"
                    ))
                .ToListAsync(cancellationToken);

            destinatarios.AddRange(responsables);

            if (ticket.TecnicoAsignado != null &&
                ticket.TecnicoAsignado.Activo &&
                ticket.TecnicoAsignado.EmailConfirmado)
            {
                destinatarios.Add(ticket.TecnicoAsignado);
            }

            return destinatarios
                .Where(d => !string.IsNullOrWhiteSpace(d.Correo))
                .GroupBy(d => d.Correo.ToLower())
                .Select(g => g.First())
                .ToList();
        }

        private static string CrearCorreoAlertaSla(
            string nombreDestinatario,
            Ticket ticket,
            string tipoAlerta,
            DateTime fechaLimiteResolucion,
            double horasRestantesResolucion)
        {
            string titulo = tipoAlerta == TipoAlertaVencido
                ? "Ticket vencido por SLA"
                : "Ticket próximo a vencer SLA";

            string tiempoFormateado = FormatearDuracionHoras(Math.Abs(horasRestantesResolucion));

            string estadoSla = tipoAlerta == TipoAlertaVencido
                ? $"El ticket ya superó su tiempo límite de resolución por {tiempoFormateado}."
                : $"Al ticket le quedan aproximadamente {tiempoFormateado} para vencer su SLA de resolución.";

            return CrearPlantillaCorreo(
                titulo,
                nombreDestinatario,
                $@"
                    <p>{EscaparHtml(estadoSla)}</p>
                    <p><strong>Número de ticket:</strong> #{ticket.Id}</p>
                    <p><strong>Título:</strong> {EscaparHtml(ticket.Titulo)}</p>
                    <p><strong>Estado actual:</strong> {EscaparHtml(ticket.EstadoTicket?.Nombre ?? "Sin estado")}</p>
                    <p><strong>Prioridad:</strong> {EscaparHtml(ticket.Prioridad?.Nombre ?? "Sin prioridad")}</p>
                    <p><strong>Solicitante:</strong> {EscaparHtml(ticket.UsuarioSolicitante?.NombreCompleto ?? "Sin solicitante")}</p>
                    <p><strong>Técnico asignado:</strong> {EscaparHtml(ticket.TecnicoAsignado?.NombreCompleto ?? "Sin técnico asignado")}</p>
                    <p><strong>Fecha límite de resolución:</strong> {fechaLimiteResolucion:yyyy-MM-dd HH:mm} UTC</p>
                    <p>Se recomienda revisar el caso para evitar incumplimientos operativos o dar seguimiento inmediato.</p>
                ");
        }

        private static string CrearPlantillaCorreo(string titulo, string nombreDestinatario, string contenido)
        {
            return $@"
                <div style=""font-family: Arial, sans-serif; color: #222; line-height: 1.5;"">
                    <h2 style=""color: #b45309;"">{EscaparHtml(titulo)}</h2>
                    <p>Hola {EscaparHtml(nombreDestinatario)},</p>
                    {contenido}
                    <hr />
                    <p style=""font-size: 12px; color: #666;"">
                        Este mensaje fue enviado automáticamente por el Sistema de Gestión de Incidentes Tecnológicos UTO.
                    </p>
                </div>";
        }

        private static DateTime NormalizarFechaUtc(DateTime fecha)
        {
            return fecha.Kind == DateTimeKind.Unspecified
                ? DateTime.SpecifyKind(fecha, DateTimeKind.Utc)
                : fecha.ToUniversalTime();
        }

        private static string FormatearDuracionHoras(double horas)
        {
            if (horas < 0)
            {
                horas = Math.Abs(horas);
            }

            var tiempo = TimeSpan.FromHours(horas);

            int dias = tiempo.Days;
            int horasEnteras = tiempo.Hours;
            int minutos = tiempo.Minutes;

            var partes = new List<string>();

            if (dias > 0)
            {
                partes.Add(dias == 1 ? "1 día" : $"{dias} días");
            }

            if (horasEnteras > 0)
            {
                partes.Add(horasEnteras == 1 ? "1 hora" : $"{horasEnteras} horas");
            }

            if (minutos > 0)
            {
                partes.Add(minutos == 1 ? "1 minuto" : $"{minutos} minutos");
            }

            if (partes.Count == 0)
            {
                return "menos de 1 minuto";
            }

            if (partes.Count == 1)
            {
                return partes[0];
            }

            return string.Join(", ", partes.Take(partes.Count - 1)) + " y " + partes.Last();
        }

        private static string EscaparHtml(string valor)
        {
            return System.Net.WebUtility.HtmlEncode(valor);
        }
    }
}