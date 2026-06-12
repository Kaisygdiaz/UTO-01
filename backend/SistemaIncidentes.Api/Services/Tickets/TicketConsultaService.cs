using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using SistemaIncidentes.Api.Data;
using SistemaIncidentes.Api.DTOs;
using SistemaIncidentes.Api.Helpers.Tickets;
using SistemaIncidentes.Api.Models;

namespace SistemaIncidentes.Api.Services
{
    public class TicketConsultaService : ITicketConsultaService
    {
        private readonly ApplicationDbContext _context;

        public TicketConsultaService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<TicketOperacionResultado> ListarTicketsAsync(
            ClaimsPrincipal user,
            string? estado,
            string? prioridad,
            int? categoriaId,
            int? tecnicoId,
            int? solicitanteId,
            DateTime? fechaInicio,
            DateTime? fechaFin)
        {
            var datosUsuario = ObtenerDatosUsuario(user);

            if (datosUsuario == null)
            {
                return TicketOperacionResultado.Unauthorized(new { mensaje = "No se pudo identificar al usuario autenticado." });
            }

            var query = ObtenerQueryTicketsPorRol(datosUsuario.Value.UsuarioId, datosUsuario.Value.RolUsuario);

            if (query == null)
            {
                return TicketOperacionResultado.Forbidden();
            }

            if (!string.IsNullOrWhiteSpace(estado))
            {
                string estadoNormalizado = estado.Trim().ToLower();

                query = query.Where(t =>
                    t.EstadoTicket != null &&
                    t.EstadoTicket.Nombre.ToLower() == estadoNormalizado);
            }

            if (!string.IsNullOrWhiteSpace(prioridad))
            {
                string prioridadNormalizada = prioridad.Trim().ToLower();

                query = query.Where(t =>
                    t.Prioridad != null &&
                    t.Prioridad.Nombre.ToLower() == prioridadNormalizada);
            }

            if (categoriaId.HasValue)
            {
                query = query.Where(t => t.CategoriaId == categoriaId.Value);
            }

            if (tecnicoId.HasValue)
            {
                if (datosUsuario.Value.RolUsuario == "Técnico" && tecnicoId.Value != datosUsuario.Value.UsuarioId)
                {
                    return TicketOperacionResultado.Forbidden();
                }

                query = query.Where(t => t.TecnicoAsignadoId == tecnicoId.Value);
            }

            if (solicitanteId.HasValue)
            {
                if (datosUsuario.Value.RolUsuario == "Solicitante" && solicitanteId.Value != datosUsuario.Value.UsuarioId)
                {
                    return TicketOperacionResultado.Forbidden();
                }

                query = query.Where(t => t.UsuarioSolicitanteId == solicitanteId.Value);
            }

            if (fechaInicio.HasValue && fechaFin.HasValue && fechaInicio.Value.Date > fechaFin.Value.Date)
            {
                return TicketOperacionResultado.BadRequest(new { mensaje = "La fecha de inicio no puede ser mayor que la fecha fin." });
            }

            if (fechaInicio.HasValue)
            {
                var inicio = DateTime.SpecifyKind(fechaInicio.Value.Date, DateTimeKind.Utc);
                query = query.Where(t => t.FechaCreacion >= inicio);
            }

            if (fechaFin.HasValue)
            {
                var fin = DateTime.SpecifyKind(fechaFin.Value.Date.AddDays(1), DateTimeKind.Utc);
                query = query.Where(t => t.FechaCreacion < fin);
            }

            var ticketsEntidad = await query
                .OrderByDescending(t => t.FechaCreacion)
                .ToListAsync();

            var tickets = ticketsEntidad
                .Select(TicketResponseMapper.ToResponseDto)
                .ToList();

            return TicketOperacionResultado.Ok(new
            {
                total = tickets.Count,
                filtrosAplicados = new
                {
                    estado,
                    prioridad,
                    categoriaId,
                    tecnicoId,
                    solicitanteId,
                    fechaInicio = fechaInicio?.ToString("yyyy-MM-dd"),
                    fechaFin = fechaFin?.ToString("yyyy-MM-dd")
                },
                tickets
            });
        }

        public async Task<TicketOperacionResultado> ObtenerTicketPorIdAsync(int id, ClaimsPrincipal user)
        {
            var datosUsuario = ObtenerDatosUsuario(user);

            if (datosUsuario == null)
            {
                return TicketOperacionResultado.Unauthorized(new { mensaje = "No se pudo identificar al usuario autenticado." });
            }

            var query = _context.Tickets
                .Include(t => t.UsuarioSolicitante)
                .Include(t => t.TecnicoAsignado)
                .Include(t => t.Categoria)
                .Include(t => t.EstadoTicket)
                .Include(t => t.Prioridad)
                .Where(t => t.Id == id)
                .AsQueryable();

            if (datosUsuario.Value.RolUsuario == "Solicitante")
            {
                query = query.Where(t => t.UsuarioSolicitanteId == datosUsuario.Value.UsuarioId);
            }
            else if (datosUsuario.Value.RolUsuario == "Técnico")
            {
                query = query.Where(t => t.TecnicoAsignadoId == datosUsuario.Value.UsuarioId);
            }
            else if (datosUsuario.Value.RolUsuario != "Administrador" && datosUsuario.Value.RolUsuario != "Jefe DTI")
            {
                return TicketOperacionResultado.Forbidden();
            }

            var ticketEntidad = await query.FirstOrDefaultAsync();

            if (ticketEntidad == null)
            {
                return TicketOperacionResultado.NotFound(new { mensaje = "Ticket no encontrado o no tiene permisos para consultarlo." });
            }

            return TicketOperacionResultado.Ok(TicketResponseMapper.ToResponseDto(ticketEntidad));
        }

        public async Task<TicketOperacionResultado> ObtenerBitacoraTicketAsync(int id, ClaimsPrincipal user)
        {
            var datosUsuario = ObtenerDatosUsuario(user);

            if (datosUsuario == null)
            {
                return TicketOperacionResultado.Unauthorized(new { mensaje = "No se pudo identificar al usuario autenticado." });
            }

            if (datosUsuario.Value.RolUsuario == "Solicitante")
            {
                return TicketOperacionResultado.Forbidden();
            }

            var ticket = await _context.Tickets.FirstOrDefaultAsync(t => t.Id == id);

            if (ticket == null)
            {
                return TicketOperacionResultado.NotFound(new { mensaje = "Ticket no encontrado." });
            }

            if (!UsuarioTienePermisoSobreTicket(ticket, datosUsuario.Value.UsuarioId, datosUsuario.Value.RolUsuario))
            {
                return TicketOperacionResultado.Forbidden();
            }

            var bitacora = await _context.BitacoraAuditoria
                .Include(b => b.Usuario)
                .Where(b => b.TicketId == id)
                .OrderBy(b => b.FechaRegistro)
                .Select(b => new BitacoraResponseDto
                {
                    Id = b.Id,
                    TicketId = b.TicketId,
                    Usuario = b.Usuario != null ? b.Usuario.NombreCompleto : string.Empty,
                    Accion = b.Accion,
                    Detalle = b.Detalle,
                    FechaRegistro = b.FechaRegistro
                })
                .ToListAsync();

            return TicketOperacionResultado.Ok(bitacora);
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

        private static bool UsuarioTienePermisoSobreTicket(Ticket ticket, int usuarioId, string? rolUsuario)
        {
            if (rolUsuario == "Administrador" || rolUsuario == "Jefe DTI")
            {
                return true;
            }

            if (rolUsuario == "Solicitante" && ticket.UsuarioSolicitanteId == usuarioId)
            {
                return true;
            }

            if (rolUsuario == "Técnico" && ticket.TecnicoAsignadoId == usuarioId)
            {
                return true;
            }

            return false;
        }
    }
}
