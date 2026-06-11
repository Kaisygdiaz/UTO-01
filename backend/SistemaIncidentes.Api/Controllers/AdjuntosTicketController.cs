using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaIncidentes.Api.Data;
using SistemaIncidentes.Api.DTOs;
using SistemaIncidentes.Api.Models;
using SistemaIncidentes.Api.Services;

namespace SistemaIncidentes.Api.Controllers
{
    [ApiController]
    [Route("api/Tickets/{ticketId:int}/adjuntos")]
    [Authorize]
    public class AdjuntosTicketController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _environment;
        private readonly IEmailService _emailService;
        private readonly ILogger<AdjuntosTicketController> _logger;

        private const long TamanoMaximoArchivoBytes = 10 * 1024 * 1024;

        private static readonly string[] ExtensionesPermitidas =
        {
            ".jpg",
            ".jpeg",
            ".png",
            ".pdf",
            ".doc",
            ".docx",
            ".xls",
            ".xlsx",
            ".txt",
            ".zip"
        };

        public AdjuntosTicketController(
            ApplicationDbContext context,
            IWebHostEnvironment environment,
            IEmailService emailService,
            ILogger<AdjuntosTicketController> logger)
        {
            _context = context;
            _environment = environment;
            _emailService = emailService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> ListarAdjuntos(int ticketId)
        {
            var datosUsuario = ObtenerDatosUsuario();

            if (datosUsuario == null)
            {
                return Unauthorized(new
                {
                    mensaje = "No se pudo identificar al usuario autenticado."
                });
            }

            var ticket = await _context.Tickets
                .FirstOrDefaultAsync(t => t.Id == ticketId);

            if (ticket == null)
            {
                return NotFound(new
                {
                    mensaje = "Ticket no encontrado."
                });
            }

            if (!UsuarioTienePermisoSobreTicket(ticket, datosUsuario.Value.UsuarioId, datosUsuario.Value.RolUsuario))
            {
                return Forbid();
            }

            var adjuntos = await _context.AdjuntosTicket
                .Include(a => a.Usuario)
                .Where(a => a.TicketId == ticketId && a.Activo)
                .OrderByDescending(a => a.FechaCarga)
                .Select(a => new AdjuntoTicketResponseDto
                {
                    Id = a.Id,
                    TicketId = a.TicketId,
                    NombreArchivoOriginal = a.NombreArchivoOriginal,
                    TipoContenido = a.TipoContenido,
                    TamanoBytes = a.TamanoBytes,
                    Descripcion = a.Descripcion,
                    Usuario = a.Usuario != null ? a.Usuario.NombreCompleto : string.Empty,
                    FechaCarga = a.FechaCarga
                })
                .ToListAsync();

            return Ok(new
            {
                total = adjuntos.Count,
                adjuntos
            });
        }

        [HttpPost]
        [RequestSizeLimit(TamanoMaximoArchivoBytes)]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> SubirAdjunto(int ticketId, [FromForm] SubirAdjuntoTicketDto dto)
        {
            var datosUsuario = ObtenerDatosUsuario();

            if (datosUsuario == null)
            {
                return Unauthorized(new
                {
                    mensaje = "No se pudo identificar al usuario autenticado."
                });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(new
                {
                    mensaje = "Los datos enviados no son válidos.",
                    errores = ModelState
                });
            }

            var archivo = dto.Archivo;

            if (archivo == null || archivo.Length == 0)
            {
                return BadRequest(new
                {
                    mensaje = "Debe seleccionar un archivo válido."
                });
            }

            if (archivo.Length > TamanoMaximoArchivoBytes)
            {
                return BadRequest(new
                {
                    mensaje = "El archivo supera el tamaño máximo permitido de 10 MB."
                });
            }

            var extension = Path.GetExtension(archivo.FileName).ToLowerInvariant();

            if (string.IsNullOrWhiteSpace(extension) || !ExtensionesPermitidas.Contains(extension))
            {
                return BadRequest(new
                {
                    mensaje = "El tipo de archivo no está permitido.",
                    extensionesPermitidas = ExtensionesPermitidas
                });
            }

            var usuarioAdjunto = await _context.Usuarios
                .Include(u => u.Rol)
                .FirstOrDefaultAsync(u => u.Id == datosUsuario.Value.UsuarioId && u.Activo);

            if (usuarioAdjunto == null)
            {
                return Unauthorized(new
                {
                    mensaje = "Usuario no encontrado o inactivo."
                });
            }

            var ticket = await _context.Tickets
                .Include(t => t.UsuarioSolicitante)
                .Include(t => t.TecnicoAsignado)
                .Include(t => t.EstadoTicket)
                .FirstOrDefaultAsync(t => t.Id == ticketId);

            if (ticket == null)
            {
                return NotFound(new
                {
                    mensaje = "Ticket no encontrado."
                });
            }

            if (!UsuarioTienePermisoSobreTicket(ticket, datosUsuario.Value.UsuarioId, datosUsuario.Value.RolUsuario))
            {
                return Forbid();
            }

            if (ticket.EstadoTicket != null &&
                (ticket.EstadoTicket.Nombre == "Cerrado" || ticket.EstadoTicket.Nombre == "Cancelado"))
            {
                return BadRequest(new
                {
                    mensaje = "No se pueden agregar adjuntos a tickets cerrados o cancelados."
                });
            }

            var nombreOriginal = Path.GetFileName(archivo.FileName);
            var nombreGuardado = $"{Guid.NewGuid()}{extension}";

            var carpetaRelativa = Path.Combine("Uploads", "Tickets", ticketId.ToString());
            var carpetaFisica = Path.Combine(_environment.ContentRootPath, carpetaRelativa);

            Directory.CreateDirectory(carpetaFisica);

            var rutaRelativa = Path.Combine(carpetaRelativa, nombreGuardado);
            var rutaFisica = Path.Combine(_environment.ContentRootPath, rutaRelativa);

            await using (var stream = new FileStream(rutaFisica, FileMode.Create))
            {
                await archivo.CopyToAsync(stream);
            }

            var adjunto = new AdjuntoTicket
            {
                TicketId = ticket.Id,
                UsuarioId = datosUsuario.Value.UsuarioId,
                NombreArchivoOriginal = nombreOriginal,
                NombreArchivoGuardado = nombreGuardado,
                RutaArchivo = rutaRelativa,
                TipoContenido = archivo.ContentType,
                TamanoBytes = archivo.Length,
                Descripcion = string.IsNullOrWhiteSpace(dto.Descripcion) ? null : dto.Descripcion.Trim(),
                FechaCarga = DateTime.UtcNow,
                Activo = true
            };

            await _context.AdjuntosTicket.AddAsync(adjunto);

            await RegistrarBitacoraAsync(
                ticket.Id,
                datosUsuario.Value.UsuarioId,
                "Adjunto agregado",
                $"Se agregó el archivo '{nombreOriginal}' como evidencia del ticket."
            );

            await _context.SaveChangesAsync();

            await NotificarAdjuntoAsync(ticket, adjunto, usuarioAdjunto);

            var adjuntoCreado = await _context.AdjuntosTicket
                .Include(a => a.Usuario)
                .Where(a => a.Id == adjunto.Id)
                .Select(a => new AdjuntoTicketResponseDto
                {
                    Id = a.Id,
                    TicketId = a.TicketId,
                    NombreArchivoOriginal = a.NombreArchivoOriginal,
                    TipoContenido = a.TipoContenido,
                    TamanoBytes = a.TamanoBytes,
                    Descripcion = a.Descripcion,
                    Usuario = a.Usuario != null ? a.Usuario.NombreCompleto : string.Empty,
                    FechaCarga = a.FechaCarga
                })
                .FirstAsync();

            return CreatedAtAction(
                nameof(ListarAdjuntos),
                new { ticketId = ticket.Id },
                new
                {
                    mensaje = "Adjunto cargado correctamente.",
                    adjunto = adjuntoCreado
                });
        }

        [HttpGet("{adjuntoId:int}/descargar")]
        public async Task<IActionResult> DescargarAdjunto(int ticketId, int adjuntoId)
        {
            var datosUsuario = ObtenerDatosUsuario();

            if (datosUsuario == null)
            {
                return Unauthorized(new
                {
                    mensaje = "No se pudo identificar al usuario autenticado."
                });
            }

            var ticket = await _context.Tickets
                .FirstOrDefaultAsync(t => t.Id == ticketId);

            if (ticket == null)
            {
                return NotFound(new
                {
                    mensaje = "Ticket no encontrado."
                });
            }

            if (!UsuarioTienePermisoSobreTicket(ticket, datosUsuario.Value.UsuarioId, datosUsuario.Value.RolUsuario))
            {
                return Forbid();
            }

            var adjunto = await _context.AdjuntosTicket
                .FirstOrDefaultAsync(a => a.Id == adjuntoId && a.TicketId == ticketId && a.Activo);

            if (adjunto == null)
            {
                return NotFound(new
                {
                    mensaje = "Adjunto no encontrado."
                });
            }

            var rutaFisica = Path.Combine(_environment.ContentRootPath, adjunto.RutaArchivo);

            if (!System.IO.File.Exists(rutaFisica))
            {
                return NotFound(new
                {
                    mensaje = "El archivo físico no fue encontrado en el servidor."
                });
            }

            var bytes = await System.IO.File.ReadAllBytesAsync(rutaFisica);

            return File(bytes, adjunto.TipoContenido, adjunto.NombreArchivoOriginal);
        }

        [HttpDelete("{adjuntoId:int}")]
        public async Task<IActionResult> EliminarAdjunto(int ticketId, int adjuntoId)
        {
            var datosUsuario = ObtenerDatosUsuario();

            if (datosUsuario == null)
            {
                return Unauthorized(new
                {
                    mensaje = "No se pudo identificar al usuario autenticado."
                });
            }

            var ticket = await _context.Tickets
                .Include(t => t.EstadoTicket)
                .FirstOrDefaultAsync(t => t.Id == ticketId);

            if (ticket == null)
            {
                return NotFound(new
                {
                    mensaje = "Ticket no encontrado."
                });
            }

            if (!UsuarioTienePermisoSobreTicket(ticket, datosUsuario.Value.UsuarioId, datosUsuario.Value.RolUsuario))
            {
                return Forbid();
            }

            if (ticket.EstadoTicket != null &&
                (ticket.EstadoTicket.Nombre == "Cerrado" || ticket.EstadoTicket.Nombre == "Cancelado"))
            {
                return BadRequest(new
                {
                    mensaje = "No se pueden eliminar adjuntos de tickets cerrados o cancelados."
                });
            }

            var adjunto = await _context.AdjuntosTicket
                .FirstOrDefaultAsync(a => a.Id == adjuntoId && a.TicketId == ticketId && a.Activo);

            if (adjunto == null)
            {
                return NotFound(new
                {
                    mensaje = "Adjunto no encontrado."
                });
            }

            bool esAutorAdjunto = adjunto.UsuarioId == datosUsuario.Value.UsuarioId;
            bool esAdministradorOJefe = datosUsuario.Value.RolUsuario == "Administrador" || datosUsuario.Value.RolUsuario == "Jefe DTI";

            if (!esAutorAdjunto && !esAdministradorOJefe)
            {
                return Forbid();
            }

            adjunto.Activo = false;

            await RegistrarBitacoraAsync(
                ticket.Id,
                datosUsuario.Value.UsuarioId,
                "Adjunto eliminado",
                $"Se eliminó lógicamente el archivo '{adjunto.NombreArchivoOriginal}' del ticket."
            );

            await _context.SaveChangesAsync();

            return Ok(new
            {
                mensaje = "Adjunto eliminado correctamente."
            });
        }

        private (int UsuarioId, string? RolUsuario)? ObtenerDatosUsuario()
        {
            var usuarioIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var rolUsuario = User.FindFirst(ClaimTypes.Role)?.Value;

            if (string.IsNullOrWhiteSpace(usuarioIdClaim) || !int.TryParse(usuarioIdClaim, out int usuarioId))
            {
                return null;
            }

            return (usuarioId, rolUsuario);
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

        private async Task NotificarAdjuntoAsync(Ticket ticket, AdjuntoTicket adjunto, Usuario usuarioAdjunto)
        {
            string rolUsuario = usuarioAdjunto.Rol?.Nombre ?? string.Empty;

            var destinatarios = new List<Usuario>();

            if (rolUsuario == "Solicitante")
            {
                if (ticket.TecnicoAsignado != null &&
                    ticket.TecnicoAsignado.Id != usuarioAdjunto.Id)
                {
                    destinatarios.Add(ticket.TecnicoAsignado);
                }
            }
            else if (rolUsuario == "Técnico")
            {
                if (ticket.UsuarioSolicitante != null &&
                    ticket.UsuarioSolicitante.Id != usuarioAdjunto.Id)
                {
                    destinatarios.Add(ticket.UsuarioSolicitante);
                }
            }
            else if (rolUsuario == "Administrador" || rolUsuario == "Jefe DTI")
            {
                if (ticket.UsuarioSolicitante != null &&
                    ticket.UsuarioSolicitante.Id != usuarioAdjunto.Id)
                {
                    destinatarios.Add(ticket.UsuarioSolicitante);
                }

                if (ticket.TecnicoAsignado != null &&
                    ticket.TecnicoAsignado.Id != usuarioAdjunto.Id)
                {
                    destinatarios.Add(ticket.TecnicoAsignado);
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
                    $"Nuevo adjunto en ticket #{ticket.Id} - {ticket.Titulo}",
                    CrearCorreoAdjunto(
                        destinatario.NombreCompleto,
                        ticket,
                        adjunto,
                        usuarioAdjunto.NombreCompleto,
                        rolUsuario),
                    ticket.Id,
                    "Error notificación adjunto");
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

        private static string CrearCorreoAdjunto(
            string nombreDestinatario,
            Ticket ticket,
            AdjuntoTicket adjunto,
            string nombreAutor,
            string rolAutor)
        {
            return CrearPlantillaCorreo(
                "Nuevo adjunto agregado",
                nombreDestinatario,
                $@"
                    <p>Se agregó un nuevo archivo adjunto como evidencia del ticket.</p>
                    <p><strong>Número de ticket:</strong> #{ticket.Id}</p>
                    <p><strong>Título:</strong> {EscaparHtml(ticket.Titulo)}</p>
                    <p><strong>Archivo:</strong> {EscaparHtml(adjunto.NombreArchivoOriginal)}</p>
                    <p><strong>Subido por:</strong> {EscaparHtml(nombreAutor)} ({EscaparHtml(rolAutor)})</p>
                    {(string.IsNullOrWhiteSpace(adjunto.Descripcion) ? string.Empty : $"<p><strong>Descripción:</strong> {EscaparHtml(adjunto.Descripcion)}</p>")}
                    <p>Puede ingresar al sistema para revisar o descargar la evidencia.</p>
                ");
        }

        private static string CrearPlantillaCorreo(string titulo, string nombreDestinatario, string contenido)
        {
            return $@"
                <div style=""font-family: Arial, sans-serif; color: #222; line-height: 1.5;"">
                    <h2 style=""color: #1f4e79;"">{EscaparHtml(titulo)}</h2>
                    <p>Hola {EscaparHtml(nombreDestinatario)},</p>
                    {contenido}
                    <hr />
                    <p style=""font-size: 12px; color: #666;"">
                        Este mensaje fue enviado automáticamente por el Sistema de Gestión de Incidentes Tecnológicos UTO.
                    </p>
                </div>";
        }

        private static string EscaparHtml(string valor)
        {
            return System.Net.WebUtility.HtmlEncode(valor);
        }
    }
}