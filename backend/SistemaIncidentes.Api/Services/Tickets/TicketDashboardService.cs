using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using SistemaIncidentes.Api.Data;
using SistemaIncidentes.Api.DTOs;
using SistemaIncidentes.Api.Models;

namespace SistemaIncidentes.Api.Services
{
    public class TicketDashboardService : ITicketDashboardService
    {
        private readonly ApplicationDbContext _context;

        public TicketDashboardService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<DashboardOperacionResultado> ObtenerDashboardAsync(ClaimsPrincipal user)
        {
            var datosUsuario = ObtenerDatosUsuario(user);

            if (datosUsuario == null)
            {
                return DashboardOperacionResultado.Unauthorized(new { mensaje = "No se pudo identificar al usuario autenticado." });
            }

            if (datosUsuario.Value.RolUsuario != "Administrador" &&
                datosUsuario.Value.RolUsuario != "Jefe DTI")
            {
                return DashboardOperacionResultado.Forbidden();
            }

            var query = ObtenerQueryTicketsPorRol(datosUsuario.Value.UsuarioId, datosUsuario.Value.RolUsuario);

            if (query == null)
            {
                return DashboardOperacionResultado.Forbidden();
            }

            var tickets = await query.ToListAsync();
            var fechaActual = DateTime.UtcNow;

            int ticketsVencidosRespuesta = 0;
            int ticketsVencidosResolucion = 0;
            int ticketsDentroSla = 0;
            int ticketsFueraSla = 0;
            int ticketsEvaluadosSla = 0;
            int ticketsExcluidosSla = 0;

            var ticketsVencidosDetalle = new List<DetalleSlaTicketDto>();
            var ticketsProximosAVencerDetalle = new List<DetalleSlaTicketDto>();

            foreach (var ticket in tickets)
            {
                string estadoActual = ticket.EstadoTicket?.Nombre ?? string.Empty;

                if (estadoActual == "Cancelado" || ticket.Prioridad == null)
                {
                    ticketsExcluidosSla++;
                    continue;
                }

                ticketsEvaluadosSla++;

                var fechaCreacion = NormalizarFechaUtc(ticket.FechaCreacion);
                var limiteRespuesta = fechaCreacion.AddHours(ticket.Prioridad.TiempoRespuestaHoras);
                var limiteResolucion = fechaCreacion.AddHours(ticket.Prioridad.TiempoResolucionHoras);

                bool incumpleRespuesta = false;
                bool incumpleResolucion = false;

                if (ticket.FechaPrimeraRespuesta.HasValue)
                {
                    var fechaPrimeraRespuesta = NormalizarFechaUtc(ticket.FechaPrimeraRespuesta.Value);
                    incumpleRespuesta = fechaPrimeraRespuesta > limiteRespuesta;
                }
                else if (estadoActual != "Cerrado")
                {
                    incumpleRespuesta = fechaActual > limiteRespuesta;
                }

                if (ticket.FechaResolucion.HasValue)
                {
                    var fechaResolucion = NormalizarFechaUtc(ticket.FechaResolucion.Value);
                    incumpleResolucion = fechaResolucion > limiteResolucion;
                }
                else if (ticket.FechaCierre.HasValue)
                {
                    var fechaCierre = NormalizarFechaUtc(ticket.FechaCierre.Value);
                    incumpleResolucion = fechaCierre > limiteResolucion;
                }
                else if (estadoActual != "Cerrado")
                {
                    incumpleResolucion = fechaActual > limiteResolucion;
                }

                if (incumpleRespuesta)
                {
                    ticketsVencidosRespuesta++;
                }

                if (incumpleResolucion)
                {
                    ticketsVencidosResolucion++;
                }

                if (incumpleRespuesta || incumpleResolucion)
                {
                    ticketsFueraSla++;

                    ticketsVencidosDetalle.Add(CrearDetalleSla(
                        ticket,
                        limiteRespuesta,
                        limiteResolucion,
                        fechaActual,
                        incumpleRespuesta,
                        incumpleResolucion));
                }
                else
                {
                    ticketsDentroSla++;

                    bool ticketActivoSinResolver =
                        estadoActual == "Abierto" ||
                        estadoActual == "En proceso" ||
                        estadoActual == "Escalado";

                    if (ticketActivoSinResolver && !ticket.FechaResolucion.HasValue)
                    {
                        var horasRestantesResolucion = (decimal)(limiteResolucion - fechaActual).TotalHours;
                        var umbralProximoVencimiento = Math.Max(1, ticket.Prioridad.TiempoResolucionHoras * 0.25m);

                        if (horasRestantesResolucion > 0 && horasRestantesResolucion <= umbralProximoVencimiento)
                        {
                            ticketsProximosAVencerDetalle.Add(CrearDetalleSla(
                                ticket,
                                limiteRespuesta,
                                limiteResolucion,
                                fechaActual,
                                false,
                                false));
                        }
                    }
                }
            }

            decimal porcentajeCumplimientoSla = ticketsEvaluadosSla == 0
                ? 100
                : Math.Round((decimal)ticketsDentroSla * 100 / ticketsEvaluadosSla, 2);

            decimal porcentajeIncumplimientoSla = ticketsEvaluadosSla == 0
                ? 0
                : Math.Round((decimal)ticketsFueraSla * 100 / ticketsEvaluadosSla, 2);

            var dashboard = new DashboardTicketsDto
            {
                TotalTickets = tickets.Count,
                TicketsAbiertos = tickets.Count(t => t.EstadoTicket != null && t.EstadoTicket.Nombre == "Abierto"),
                TicketsEnProceso = tickets.Count(t => t.EstadoTicket != null && t.EstadoTicket.Nombre == "En proceso"),
                TicketsEscalados = tickets.Count(t => t.EstadoTicket != null && t.EstadoTicket.Nombre == "Escalado"),
                TicketsResueltos = tickets.Count(t => t.EstadoTicket != null && t.EstadoTicket.Nombre == "Resuelto"),
                TicketsCerrados = tickets.Count(t => t.EstadoTicket != null && t.EstadoTicket.Nombre == "Cerrado"),
                TicketsCancelados = tickets.Count(t => t.EstadoTicket != null && t.EstadoTicket.Nombre == "Cancelado"),
                TicketsEvaluadosSla = ticketsEvaluadosSla,
                TicketsExcluidosSla = ticketsExcluidosSla,
                TicketsVencidosRespuesta = ticketsVencidosRespuesta,
                TicketsVencidosResolucion = ticketsVencidosResolucion,
                TicketsDentroSla = ticketsDentroSla,
                TicketsFueraSla = ticketsFueraSla,
                PorcentajeCumplimientoSla = porcentajeCumplimientoSla,
                PorcentajeIncumplimientoSla = porcentajeIncumplimientoSla,
                FechaGeneracion = fechaActual,
                PorEstado = tickets
                    .GroupBy(t => t.EstadoTicket != null ? t.EstadoTicket.Nombre : "Sin estado")
                    .Select(g => new ConteoPorEstadoDto { Estado = g.Key, Total = g.Count() })
                    .OrderByDescending(x => x.Total)
                    .ToList(),
                PorPrioridad = tickets
                    .GroupBy(t => t.Prioridad != null ? t.Prioridad.Nombre : "Sin prioridad")
                    .Select(g => new ConteoPorPrioridadDto { Prioridad = g.Key, Total = g.Count() })
                    .OrderByDescending(x => x.Total)
                    .ToList(),
                PorCategoria = tickets
                    .GroupBy(t => t.Categoria != null ? t.Categoria.Nombre : "Sin categoría")
                    .Select(g => new ConteoPorCategoriaDto { Categoria = g.Key, Total = g.Count() })
                    .OrderByDescending(x => x.Total)
                    .ToList(),
                PorTecnico = tickets
                    .GroupBy(t => t.TecnicoAsignado != null ? t.TecnicoAsignado.NombreCompleto : "Sin asignar")
                    .Select(g => new ConteoPorTecnicoDto { Tecnico = g.Key, Total = g.Count() })
                    .OrderByDescending(x => x.Total)
                    .ToList(),
                TicketsVencidosDetalle = ticketsVencidosDetalle
                    .OrderByDescending(t => t.HorasVencidasResolucion)
                    .ThenBy(t => t.FechaLimiteResolucion)
                    .Take(10)
                    .ToList(),
                TicketsProximosAVencerDetalle = ticketsProximosAVencerDetalle
                    .OrderBy(t => t.HorasRestantesResolucion)
                    .ThenBy(t => t.FechaLimiteResolucion)
                    .Take(10)
                    .ToList()
            };

            return DashboardOperacionResultado.Ok(dashboard);
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

        private IQueryable<Ticket>? ObtenerQueryTicketsPorRol(int usuarioId, string? rolUsuario)
        {
            var query = _context.Tickets
                .Include(t => t.UsuarioSolicitante)
                .Include(t => t.TecnicoAsignado)
                .Include(t => t.Categoria)
                .Include(t => t.EstadoTicket)
                .Include(t => t.Prioridad)
                .AsQueryable();

            if (rolUsuario == "Solicitante")
            {
                return query.Where(t => t.UsuarioSolicitanteId == usuarioId);
            }

            if (rolUsuario == "Técnico")
            {
                return query.Where(t => t.TecnicoAsignadoId == usuarioId);
            }

            if (rolUsuario == "Administrador" || rolUsuario == "Jefe DTI")
            {
                return query;
            }

            return null;
        }

        private static DetalleSlaTicketDto CrearDetalleSla(
            Ticket ticket,
            DateTime limiteRespuesta,
            DateTime limiteResolucion,
            DateTime fechaActual,
            bool incumpleRespuesta,
            bool incumpleResolucion)
        {
            decimal horasRestantesResolucion = Math.Round((decimal)(limiteResolucion - fechaActual).TotalHours, 2);
            decimal horasVencidasResolucion = Math.Round((decimal)(fechaActual - limiteResolucion).TotalHours, 2);

            if (horasRestantesResolucion < 0)
            {
                horasRestantesResolucion = 0;
            }

            if (horasVencidasResolucion < 0)
            {
                horasVencidasResolucion = 0;
            }

            string tipoAlerta;

            if (incumpleRespuesta && incumpleResolucion)
            {
                tipoAlerta = "Vencido por respuesta y resolucion";
            }
            else if (incumpleRespuesta)
            {
                tipoAlerta = "Vencido por respuesta";
            }
            else if (incumpleResolucion)
            {
                tipoAlerta = "Vencido por resolucion";
            }
            else
            {
                tipoAlerta = "Proximo a vencer";
            }

            return new DetalleSlaTicketDto
            {
                Id = ticket.Id,
                Titulo = ticket.Titulo,
                Estado = ticket.EstadoTicket != null ? ticket.EstadoTicket.Nombre : "Sin estado",
                Prioridad = ticket.Prioridad != null ? ticket.Prioridad.Nombre : "Sin prioridad",
                TecnicoAsignado = ticket.TecnicoAsignado != null ? ticket.TecnicoAsignado.NombreCompleto : null,
                FechaCreacion = NormalizarFechaUtc(ticket.FechaCreacion),
                FechaLimiteRespuesta = limiteRespuesta,
                FechaLimiteResolucion = limiteResolucion,
                HorasRestantesResolucion = horasRestantesResolucion,
                HorasVencidasResolucion = horasVencidasResolucion,
                TipoAlerta = tipoAlerta
            };
        }

        private static DateTime NormalizarFechaUtc(DateTime fecha)
        {
            return fecha.Kind == DateTimeKind.Unspecified
                ? DateTime.SpecifyKind(fecha, DateTimeKind.Utc)
                : fecha.ToUniversalTime();
        }
    }
}