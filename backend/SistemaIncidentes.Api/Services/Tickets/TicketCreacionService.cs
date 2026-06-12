using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SistemaIncidentes.Api.Data;
using SistemaIncidentes.Api.DTOs;
using SistemaIncidentes.Api.Helpers.Tickets;
using SistemaIncidentes.Api.Models;

namespace SistemaIncidentes.Api.Services
{
    public class TicketCreacionService : ITicketCreacionService
    {
        private readonly ApplicationDbContext _context;
        private readonly IEmailService _emailService;
        private readonly ILogger<TicketCreacionService> _logger;

        public TicketCreacionService(
            ApplicationDbContext context,
            IEmailService emailService,
            ILogger<TicketCreacionService> logger)
        {
            _context = context;
            _emailService = emailService;
            _logger = logger;
        }

        public async Task<TicketOperacionResultado> CrearTicketAsync(
            CrearTicketDto dto,
            ClaimsPrincipal user,
            bool modeloValido,
            object? erroresValidacion)
        {
            if (!modeloValido)
            {
                return TicketOperacionResultado.BadRequest(new { mensaje = "Los datos enviados no son válidos.", errores = erroresValidacion });
            }

            var datosUsuario = ObtenerDatosUsuario(user);

            if (datosUsuario == null)
            {
                return TicketOperacionResultado.Unauthorized(new { mensaje = "No se pudo identificar al usuario autenticado." });
            }

            var usuario = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.Id == datosUsuario.Value.UsuarioId && u.Activo);

            if (usuario == null)
            {
                return TicketOperacionResultado.Unauthorized(new { mensaje = "Usuario no encontrado o inactivo." });
            }

            var categoria = await _context.Categorias
                .FirstOrDefaultAsync(c => c.Id == dto.CategoriaId && c.Activo);

            if (categoria == null)
            {
                return TicketOperacionResultado.BadRequest(new { mensaje = "La categoría seleccionada no existe o se encuentra inactiva." });
            }

            var estadoAbierto = await _context.EstadosTicket
                .FirstOrDefaultAsync(e => e.Nombre == "Abierto" && e.Activo);

            if (estadoAbierto == null)
            {
                return TicketOperacionResultado.Error(new { mensaje = "No se encontró el estado inicial 'Abierto'. Verifique los datos base del sistema." });
            }

            var prioridad = await ObtenerPrioridadAsync(dto.Impacto, dto.Urgencia);

            if (prioridad == null)
            {
                return TicketOperacionResultado.BadRequest(new
                {
                    mensaje = "No fue posible calcular la prioridad. Verifique que el impacto y la urgencia sean válidos.",
                    valoresPermitidos = new
                    {
                        impacto = new[] { "Bajo", "Medio", "Alto" },
                        urgencia = new[] { "Baja", "Media", "Alta" }
                    }
                });
            }

            var ticket = new Ticket
            {
                Titulo = dto.Titulo.Trim(),
                Descripcion = dto.Descripcion.Trim(),
                Impacto = NormalizarTexto(dto.Impacto),
                Urgencia = NormalizarTexto(dto.Urgencia),
                UsuarioSolicitanteId = usuario.Id,
                CategoriaId = categoria.Id,
                EstadoTicketId = estadoAbierto.Id,
                PrioridadId = prioridad.Id,
                FechaCreacion = DateTime.UtcNow
            };

            _context.Tickets.Add(ticket);
            await _context.SaveChangesAsync();

            await RegistrarBitacoraAsync(
                ticket.Id,
                usuario.Id,
                "Ticket creado",
                $"El ticket fue creado con categoría {categoria.Nombre}, prioridad {prioridad.Nombre} y estado Abierto.");

            await _context.SaveChangesAsync();

            await EnviarCorreoSeguroAsync(
                usuario.Correo,
                $"Ticket #{ticket.Id} registrado - {ticket.Titulo}",
                TicketEmailTemplateBuilder.CrearCorreoTicketCreado(usuario.NombreCompleto, ticket, categoria.Nombre, prioridad.Nombre),
                ticket.Id,
                "Error notificación creación");

            var ticketCreado = await ObtenerTicketResponsePorIdAsync(ticket.Id);

            return TicketOperacionResultado.Created(ticket.Id, ticketCreado);
        }

        private static (int UsuarioId, string? RolUsuario)? ObtenerDatosUsuario(ClaimsPrincipal user)
        {
            var usuarioIdClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var rolUsuario = user.FindFirst(ClaimTypes.Role)?.Value;

            if (string.IsNullOrWhiteSpace(usuarioIdClaim) || !int.TryParse(usuarioIdClaim, out int usuarioId))
            {
                return null;
            }

            return (usuarioId, rolUsuario);
        }

        private async Task<TicketResponseDto> ObtenerTicketResponsePorIdAsync(int ticketId)
        {
            var ticket = await _context.Tickets
                .Include(t => t.UsuarioSolicitante)
                .Include(t => t.TecnicoAsignado)
                .Include(t => t.Categoria)
                .Include(t => t.EstadoTicket)
                .Include(t => t.Prioridad)
                .FirstAsync(t => t.Id == ticketId);

            return TicketResponseMapper.ToResponseDto(ticket);
        }

        private async Task RegistrarBitacoraAsync(int ticketId, int usuarioId, string accion, string? detalle)
        {
            var registro = new BitacoraAuditoria
            {
                TicketId = ticketId,
                UsuarioId = usuarioId,
                Accion = accion,
                Detalle = detalle,
                FechaRegistro = DateTime.UtcNow
            };

            await _context.BitacoraAuditoria.AddAsync(registro);
        }

        private async Task<Prioridad?> ObtenerPrioridadAsync(string impacto, string urgencia)
        {
            string impactoNormalizado = NormalizarTexto(impacto);
            string urgenciaNormalizada = NormalizarTexto(urgencia);

            var registroMatriz = await _context.MatrizPrioridades
                .Include(m => m.Prioridad)
                .FirstOrDefaultAsync(m =>
                    m.Activo &&
                    m.Impacto == impactoNormalizado &&
                    m.Urgencia == urgenciaNormalizada &&
                    m.Prioridad != null &&
                    m.Prioridad.Activo);

            return registroMatriz?.Prioridad;
        }

        private static string NormalizarTexto(string valor)
        {
            if (string.IsNullOrWhiteSpace(valor))
            {
                return string.Empty;
            }

            valor = valor.Trim().ToLower();

            return valor switch
            {
                "alto" => "Alto",
                "medio" => "Medio",
                "bajo" => "Bajo",
                "alta" => "Alta",
                "media" => "Media",
                "baja" => "Baja",
                _ => valor
            };
        }

        private async Task EnviarCorreoSeguroAsync(
            string? destinatario,
            string asunto,
            string contenidoHtml,
            int ticketId,
            string accionFallo)
        {
            if (string.IsNullOrWhiteSpace(destinatario))
            {
                return;
            }

            try
            {
                await _emailService.EnviarCorreoAsync(destinatario, asunto, contenidoHtml);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "No se pudo enviar correo para el ticket {TicketId}. Acción: {Accion}", ticketId, accionFallo);
            }
        }
    }
}
