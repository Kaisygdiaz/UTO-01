using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SistemaIncidentes.Api.Data;
using SistemaIncidentes.Api.DTOs;
using SistemaIncidentes.Api.Helpers.Tickets;
using SistemaIncidentes.Api.Models;

namespace SistemaIncidentes.Api.Services
{
    public class TicketComentarioService : ITicketComentarioService
    {
        private readonly ApplicationDbContext _context;
        private readonly IEmailService _emailService;
        private readonly ILogger<TicketComentarioService> _logger;

        public TicketComentarioService(
            ApplicationDbContext context,
            IEmailService emailService,
            ILogger<TicketComentarioService> logger)
        {
            _context = context;
            _emailService = emailService;
            _logger = logger;
        }

        public async Task<ComentarioOperacionResultado> ObtenerComentariosAsync(int ticketId, ClaimsPrincipal user)
        {
            var datosUsuario = ObtenerDatosUsuario(user);

            if (datosUsuario == null)
            {
                return ComentarioOperacionResultado.Unauthorized(new { mensaje = "No se pudo identificar al usuario autenticado." });
            }

            var ticket = await _context.Tickets.FirstOrDefaultAsync(t => t.Id == ticketId);

            if (ticket == null)
            {
                return ComentarioOperacionResultado.NotFound(new { mensaje = "Ticket no encontrado." });
            }

            if (!UsuarioTienePermisoSobreTicket(ticket, datosUsuario.Value.UsuarioId, datosUsuario.Value.RolUsuario))
            {
                return ComentarioOperacionResultado.Forbidden();
            }

            var queryComentarios = _context.ComentariosTicket
                .Include(c => c.Usuario)
                .ThenInclude(u => u!.Rol)
                .Where(c => c.TicketId == ticketId)
                .AsQueryable();

            if (datosUsuario.Value.RolUsuario == "Solicitante")
            {
                queryComentarios = queryComentarios.Where(c => !c.EsInterno);
            }

            var comentarios = await queryComentarios
                .OrderBy(c => c.FechaRegistro)
                .Select(c => new ComentarioTicketResponseDto
                {
                    Id = c.Id,
                    TicketId = c.TicketId,
                    Usuario = c.Usuario != null ? c.Usuario.NombreCompleto : string.Empty,
                    Rol = c.Usuario != null && c.Usuario.Rol != null ? c.Usuario.Rol.Nombre : string.Empty,
                    Comentario = c.Comentario,
                    EsInterno = c.EsInterno,
                    TipoComentario = c.EsInterno ? "Interno" : "Público",
                    FechaRegistro = c.FechaRegistro
                })
                .ToListAsync();

            return ComentarioOperacionResultado.Ok(comentarios);
        }

        public async Task<ComentarioOperacionResultado> CrearComentarioAsync(
            int ticketId,
            CrearComentarioTicketDto dto,
            ClaimsPrincipal user,
            bool modeloValido)
        {
            var datosUsuario = ObtenerDatosUsuario(user);

            if (datosUsuario == null)
            {
                return ComentarioOperacionResultado.Unauthorized(new { mensaje = "No se pudo identificar al usuario autenticado." });
            }

            if (!modeloValido)
            {
                return ComentarioOperacionResultado.BadRequest(new { mensaje = "Los datos enviados no son válidos." });
            }

            if (datosUsuario.Value.RolUsuario == "Solicitante" && dto.EsInterno)
            {
                return ComentarioOperacionResultado.BadRequest(new { mensaje = "El solicitante no puede crear comentarios internos." });
            }

            var usuarioComentario = await _context.Usuarios
                .Include(u => u.Rol)
                .FirstOrDefaultAsync(u => u.Id == datosUsuario.Value.UsuarioId && u.Activo);

            if (usuarioComentario == null)
            {
                return ComentarioOperacionResultado.Unauthorized(new { mensaje = "Usuario no encontrado o inactivo." });
            }

            var ticket = await _context.Tickets
                .Include(t => t.UsuarioSolicitante)
                .Include(t => t.TecnicoAsignado)
                .Include(t => t.EstadoTicket)
                .Include(t => t.Categoria)
                .Include(t => t.Prioridad)
                .FirstOrDefaultAsync(t => t.Id == ticketId);

            if (ticket == null)
            {
                return ComentarioOperacionResultado.NotFound(new { mensaje = "Ticket no encontrado." });
            }

            if (!UsuarioTienePermisoSobreTicket(ticket, datosUsuario.Value.UsuarioId, datosUsuario.Value.RolUsuario))
            {
                return ComentarioOperacionResultado.Forbidden();
            }

            if (ticket.EstadoTicket == null)
            {
                return ComentarioOperacionResultado.Error(new { mensaje = "El ticket no tiene un estado válido asociado." });
            }

            if (!EstadoPermiteComentarios(ticket.EstadoTicket.Nombre))
            {
                return ComentarioOperacionResultado.BadRequest(new { mensaje = "No se pueden agregar comentarios a tickets cerrados o cancelados." });
            }

            var comentario = new ComentarioTicket
            {
                TicketId = ticket.Id,
                UsuarioId = datosUsuario.Value.UsuarioId,
                Comentario = dto.Comentario.Trim(),
                EsInterno = dto.EsInterno,
                FechaRegistro = DateTime.UtcNow
            };

            await _context.ComentariosTicket.AddAsync(comentario);

            string tipoComentario = comentario.EsInterno ? "interno" : "público";

            var detalleComentarioBitacora =
                $"Se agregó un comentario {tipoComentario} al ticket. " +
                $"Comentario: \"{comentario.Comentario}\"";

            await RegistrarBitacoraAsync(
                ticket.Id,
                datosUsuario.Value.UsuarioId,
                comentario.EsInterno ? "Comentario interno agregado" : "Comentario público agregado",
                detalleComentarioBitacora);

            await _context.SaveChangesAsync();

            await NotificarComentarioAsync(ticket, comentario, usuarioComentario);

            var comentarioCreado = await _context.ComentariosTicket
                .Include(c => c.Usuario)
                .ThenInclude(u => u!.Rol)
                .Where(c => c.Id == comentario.Id)
                .Select(c => new ComentarioTicketResponseDto
                {
                    Id = c.Id,
                    TicketId = c.TicketId,
                    Usuario = c.Usuario != null ? c.Usuario.NombreCompleto : string.Empty,
                    Rol = c.Usuario != null && c.Usuario.Rol != null ? c.Usuario.Rol.Nombre : string.Empty,
                    Comentario = c.Comentario,
                    EsInterno = c.EsInterno,
                    TipoComentario = c.EsInterno ? "Interno" : "Público",
                    FechaRegistro = c.FechaRegistro
                })
                .FirstAsync();

            return ComentarioOperacionResultado.Created(ticket.Id, comentarioCreado);
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

        private static bool EstadoPermiteComentarios(string estado)
        {
            return estado != "Cerrado" && estado != "Cancelado";
        }

        private async Task NotificarComentarioAsync(Ticket ticket, ComentarioTicket comentario, Usuario usuarioComentario)
        {
            string rolComentario = usuarioComentario.Rol?.Nombre ?? string.Empty;

            var destinatarios = new List<Usuario>();

            if (comentario.EsInterno)
            {
                if ((rolComentario == "Administrador" || rolComentario == "Jefe DTI") &&
                    ticket.TecnicoAsignado != null &&
                    ticket.TecnicoAsignado.Id != usuarioComentario.Id)
                {
                    destinatarios.Add(ticket.TecnicoAsignado);
                }

                if (rolComentario == "Técnico")
                {
                    var jefesDti = await _context.Usuarios
                        .Include(u => u.Rol)
                        .Where(u =>
                            u.Activo &&
                            u.Rol != null &&
                            u.Rol.Nombre == "Jefe DTI" &&
                            u.Id != usuarioComentario.Id)
                        .ToListAsync();

                    destinatarios.AddRange(jefesDti);
                }
            }
            else
            {
                if (rolComentario == "Solicitante")
                {
                    if (ticket.TecnicoAsignado != null &&
                        ticket.TecnicoAsignado.Id != usuarioComentario.Id)
                    {
                        destinatarios.Add(ticket.TecnicoAsignado);
                    }
                }
                else if (rolComentario == "Técnico")
                {
                    if (ticket.UsuarioSolicitante != null &&
                        ticket.UsuarioSolicitante.Id != usuarioComentario.Id)
                    {
                        destinatarios.Add(ticket.UsuarioSolicitante);
                    }
                }
                else if (rolComentario == "Administrador" || rolComentario == "Jefe DTI")
                {
                    if (ticket.UsuarioSolicitante != null &&
                        ticket.UsuarioSolicitante.Id != usuarioComentario.Id)
                    {
                        destinatarios.Add(ticket.UsuarioSolicitante);
                    }

                    if (ticket.TecnicoAsignado != null &&
                        ticket.TecnicoAsignado.Id != usuarioComentario.Id)
                    {
                        destinatarios.Add(ticket.TecnicoAsignado);
                    }
                }
            }

            var destinatariosUnicos = destinatarios
                .Where(d => !string.IsNullOrWhiteSpace(d.Correo))
                .GroupBy(d => d.Correo.ToLower())
                .Select(g => g.First())
                .ToList();

            foreach (var destinatario in destinatariosUnicos)
            {
                await EnviarCorreoSeguroAsync(
                    destinatario.Correo,
                    $"Nuevo comentario en ticket #{ticket.Id} - {ticket.Titulo}",
                    TicketEmailTemplateBuilder.CrearCorreoComentario(
                        destinatario.NombreCompleto,
                        ticket,
                        comentario,
                        usuarioComentario.NombreCompleto,
                        rolComentario),
                    ticket.Id,
                    "Error notificación comentario");
            }
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
