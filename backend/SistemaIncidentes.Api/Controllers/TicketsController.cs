using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaIncidentes.Api.Data;
using SistemaIncidentes.Api.DTOs;
using SistemaIncidentes.Api.Models;

namespace SistemaIncidentes.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TicketsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public TicketsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> ListarTickets()
        {
            var usuarioIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var rolUsuario = User.FindFirst(ClaimTypes.Role)?.Value;

            if (string.IsNullOrWhiteSpace(usuarioIdClaim) || !int.TryParse(usuarioIdClaim, out int usuarioId))
            {
                return Unauthorized(new
                {
                    mensaje = "No se pudo identificar al usuario autenticado."
                });
            }

            var query = _context.Tickets
                .Include(t => t.UsuarioSolicitante)
                .Include(t => t.TecnicoAsignado)
                .Include(t => t.Categoria)
                .Include(t => t.EstadoTicket)
                .Include(t => t.Prioridad)
                .AsQueryable();

            if (rolUsuario == "Solicitante")
            {
                query = query.Where(t => t.UsuarioSolicitanteId == usuarioId);
            }
            else if (rolUsuario == "Técnico")
            {
                query = query.Where(t => t.TecnicoAsignadoId == usuarioId);
            }
            else if (rolUsuario != "Administrador" && rolUsuario != "Jefe DTI")
            {
                return Forbid();
            }

            var tickets = await query
                .OrderByDescending(t => t.FechaCreacion)
                .Select(t => new TicketResponseDto
                {
                    Id = t.Id,
                    Titulo = t.Titulo,
                    Descripcion = t.Descripcion,
                    Solucion = t.Solucion,
                    ComentarioCierre = t.ComentarioCierre,
                    CalificacionSatisfaccion = t.CalificacionSatisfaccion,
                    Impacto = t.Impacto,
                    Urgencia = t.Urgencia,
                    Categoria = t.Categoria != null ? t.Categoria.Nombre : string.Empty,
                    Estado = t.EstadoTicket != null ? t.EstadoTicket.Nombre : string.Empty,
                    Prioridad = t.Prioridad != null ? t.Prioridad.Nombre : string.Empty,
                    UsuarioSolicitante = t.UsuarioSolicitante != null ? t.UsuarioSolicitante.NombreCompleto : string.Empty,
                    TecnicoAsignado = t.TecnicoAsignado != null ? t.TecnicoAsignado.NombreCompleto : null,
                    FechaCreacion = t.FechaCreacion,
                    FechaPrimeraRespuesta = t.FechaPrimeraRespuesta,
                    FechaResolucion = t.FechaResolucion,
                    FechaCierre = t.FechaCierre
                })
                .ToListAsync();

            return Ok(tickets);
        }

        [HttpPost]
        public async Task<IActionResult> CrearTicket([FromBody] CrearTicketDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new
                {
                    mensaje = "Los datos enviados no son válidos.",
                    errores = ModelState
                });
            }

            var usuarioIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrWhiteSpace(usuarioIdClaim) || !int.TryParse(usuarioIdClaim, out int usuarioId))
            {
                return Unauthorized(new
                {
                    mensaje = "No se pudo identificar al usuario autenticado."
                });
            }

            var usuario = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.Id == usuarioId && u.Activo);

            if (usuario == null)
            {
                return Unauthorized(new
                {
                    mensaje = "Usuario no encontrado o inactivo."
                });
            }

            var categoria = await _context.Categorias
                .FirstOrDefaultAsync(c => c.Id == dto.CategoriaId && c.Activo);

            if (categoria == null)
            {
                return BadRequest(new
                {
                    mensaje = "La categoría seleccionada no existe o se encuentra inactiva."
                });
            }

            var estadoAbierto = await _context.EstadosTicket
                .FirstOrDefaultAsync(e => e.Nombre == "Abierto" && e.Activo);

            if (estadoAbierto == null)
            {
                return StatusCode(500, new
                {
                    mensaje = "No se encontró el estado inicial 'Abierto'. Verifique los datos base del sistema."
                });
            }

            var prioridad = await ObtenerPrioridadAsync(dto.Impacto, dto.Urgencia);

            if (prioridad == null)
            {
                return BadRequest(new
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

            var ticketCreado = await ObtenerTicketResponsePorIdAsync(ticket.Id);

            return CreatedAtAction(nameof(ObtenerTicketPorId), new { id = ticket.Id }, ticketCreado);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> ObtenerTicketPorId(int id)
        {
            var usuarioIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var rolUsuario = User.FindFirst(ClaimTypes.Role)?.Value;

            if (string.IsNullOrWhiteSpace(usuarioIdClaim) || !int.TryParse(usuarioIdClaim, out int usuarioId))
            {
                return Unauthorized(new
                {
                    mensaje = "No se pudo identificar al usuario autenticado."
                });
            }

            var query = _context.Tickets
                .Include(t => t.UsuarioSolicitante)
                .Include(t => t.TecnicoAsignado)
                .Include(t => t.Categoria)
                .Include(t => t.EstadoTicket)
                .Include(t => t.Prioridad)
                .Where(t => t.Id == id)
                .AsQueryable();

            if (rolUsuario == "Solicitante")
            {
                query = query.Where(t => t.UsuarioSolicitanteId == usuarioId);
            }
            else if (rolUsuario == "Técnico")
            {
                query = query.Where(t => t.TecnicoAsignadoId == usuarioId);
            }
            else if (rolUsuario != "Administrador" && rolUsuario != "Jefe DTI")
            {
                return Forbid();
            }

            var ticket = await query
                .Select(t => new TicketResponseDto
                {
                    Id = t.Id,
                    Titulo = t.Titulo,
                    Descripcion = t.Descripcion,
                    Solucion = t.Solucion,
                    ComentarioCierre = t.ComentarioCierre,
                    CalificacionSatisfaccion = t.CalificacionSatisfaccion,
                    Impacto = t.Impacto,
                    Urgencia = t.Urgencia,
                    Categoria = t.Categoria != null ? t.Categoria.Nombre : string.Empty,
                    Estado = t.EstadoTicket != null ? t.EstadoTicket.Nombre : string.Empty,
                    Prioridad = t.Prioridad != null ? t.Prioridad.Nombre : string.Empty,
                    UsuarioSolicitante = t.UsuarioSolicitante != null ? t.UsuarioSolicitante.NombreCompleto : string.Empty,
                    TecnicoAsignado = t.TecnicoAsignado != null ? t.TecnicoAsignado.NombreCompleto : null,
                    FechaCreacion = t.FechaCreacion,
                    FechaPrimeraRespuesta = t.FechaPrimeraRespuesta,
                    FechaResolucion = t.FechaResolucion,
                    FechaCierre = t.FechaCierre
                })
                .FirstOrDefaultAsync();

            if (ticket == null)
            {
                return NotFound(new
                {
                    mensaje = "Ticket no encontrado o no tiene permisos para consultarlo."
                });
            }

            return Ok(ticket);
        }

        [HttpPut("{id:int}/asignar")]
        public async Task<IActionResult> AsignarTicket(int id, [FromBody] AsignarTicketDto dto)
        {
            var rolUsuario = User.FindFirst(ClaimTypes.Role)?.Value;

            if (rolUsuario != "Administrador" && rolUsuario != "Jefe DTI")
            {
                return Forbid();
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(new
                {
                    mensaje = "Los datos enviados no son válidos.",
                    errores = ModelState
                });
            }

            var ticket = await _context.Tickets
                .FirstOrDefaultAsync(t => t.Id == id);

            if (ticket == null)
            {
                return NotFound(new
                {
                    mensaje = "Ticket no encontrado."
                });
            }

            var tecnico = await _context.Usuarios
                .Include(u => u.Rol)
                .FirstOrDefaultAsync(u => u.Id == dto.TecnicoId && u.Activo);

            if (tecnico == null)
            {
                return BadRequest(new
                {
                    mensaje = "El técnico seleccionado no existe o se encuentra inactivo."
                });
            }

            if (tecnico.Rol == null || tecnico.Rol.Nombre != "Técnico")
            {
                return BadRequest(new
                {
                    mensaje = "El usuario seleccionado no tiene rol de Técnico."
                });
            }

            var estadoEnProceso = await _context.EstadosTicket
                .FirstOrDefaultAsync(e => e.Nombre == "En proceso" && e.Activo);

            if (estadoEnProceso == null)
            {
                return StatusCode(500, new
                {
                    mensaje = "No se encontró el estado 'En proceso'. Verifique los datos base del sistema."
                });
            }

            ticket.TecnicoAsignadoId = tecnico.Id;
            ticket.EstadoTicketId = estadoEnProceso.Id;

            if (ticket.FechaPrimeraRespuesta == null)
            {
                ticket.FechaPrimeraRespuesta = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();

            var ticketActualizado = await ObtenerTicketResponsePorIdAsync(ticket.Id);

            return Ok(new
            {
                mensaje = "Ticket asignado correctamente.",
                ticket = ticketActualizado
            });
        }

        [HttpPut("{id:int}/resolver")]
        public async Task<IActionResult> ResolverTicket(int id, [FromBody] ResolverTicketDto dto)
        {
            var usuarioIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var rolUsuario = User.FindFirst(ClaimTypes.Role)?.Value;

            if (string.IsNullOrWhiteSpace(usuarioIdClaim) || !int.TryParse(usuarioIdClaim, out int usuarioId))
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

            var ticket = await _context.Tickets
                .Include(t => t.EstadoTicket)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (ticket == null)
            {
                return NotFound(new
                {
                    mensaje = "Ticket no encontrado."
                });
            }

            bool esTecnicoAsignado = ticket.TecnicoAsignadoId == usuarioId;
            bool esAdministradorOJefe = rolUsuario == "Administrador" || rolUsuario == "Jefe DTI";

            if (!esTecnicoAsignado && !esAdministradorOJefe)
            {
                return Forbid();
            }

            if (ticket.EstadoTicket == null ||
                (ticket.EstadoTicket.Nombre != "En proceso" && ticket.EstadoTicket.Nombre != "Escalado"))
            {
                return BadRequest(new
                {
                    mensaje = "Solo se pueden resolver tickets que estén en estado 'En proceso' o 'Escalado'."
                });
            }

            var estadoResuelto = await _context.EstadosTicket
                .FirstOrDefaultAsync(e => e.Nombre == "Resuelto" && e.Activo);

            if (estadoResuelto == null)
            {
                return StatusCode(500, new
                {
                    mensaje = "No se encontró el estado 'Resuelto'. Verifique los datos base del sistema."
                });
            }

            ticket.Solucion = dto.Solucion.Trim();
            ticket.EstadoTicketId = estadoResuelto.Id;
            ticket.FechaResolucion = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            var ticketActualizado = await ObtenerTicketResponsePorIdAsync(ticket.Id);

            return Ok(new
            {
                mensaje = "Ticket marcado como resuelto correctamente.",
                ticket = ticketActualizado
            });
        }

        [HttpPut("{id:int}/cerrar")]
        public async Task<IActionResult> CerrarTicket(int id, [FromBody] CerrarTicketDto dto)
        {
            var usuarioIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var rolUsuario = User.FindFirst(ClaimTypes.Role)?.Value;

            if (string.IsNullOrWhiteSpace(usuarioIdClaim) || !int.TryParse(usuarioIdClaim, out int usuarioId))
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

            var ticket = await _context.Tickets
                .Include(t => t.EstadoTicket)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (ticket == null)
            {
                return NotFound(new
                {
                    mensaje = "Ticket no encontrado."
                });
            }

            bool esSolicitanteDuenio = ticket.UsuarioSolicitanteId == usuarioId;
            bool esAdministradorOJefe = rolUsuario == "Administrador" || rolUsuario == "Jefe DTI";

            if (!esSolicitanteDuenio && !esAdministradorOJefe)
            {
                return Forbid();
            }

            if (ticket.EstadoTicket == null || ticket.EstadoTicket.Nombre != "Resuelto")
            {
                return BadRequest(new
                {
                    mensaje = "Solo se pueden cerrar tickets que estén en estado 'Resuelto'."
                });
            }

            var estadoCerrado = await _context.EstadosTicket
                .FirstOrDefaultAsync(e => e.Nombre == "Cerrado" && e.Activo);

            if (estadoCerrado == null)
            {
                return StatusCode(500, new
                {
                    mensaje = "No se encontró el estado 'Cerrado'. Verifique los datos base del sistema."
                });
            }

            ticket.EstadoTicketId = estadoCerrado.Id;
            ticket.FechaCierre = DateTime.UtcNow;
            ticket.ComentarioCierre = string.IsNullOrWhiteSpace(dto.ComentarioCierre)
                ? null
                : dto.ComentarioCierre.Trim();
            ticket.CalificacionSatisfaccion = dto.CalificacionSatisfaccion;

            await _context.SaveChangesAsync();

            var ticketActualizado = await ObtenerTicketResponsePorIdAsync(ticket.Id);

            return Ok(new
            {
                mensaje = "Ticket cerrado correctamente.",
                ticket = ticketActualizado
            });
        }

        private async Task<TicketResponseDto> ObtenerTicketResponsePorIdAsync(int ticketId)
        {
            return await _context.Tickets
                .Include(t => t.UsuarioSolicitante)
                .Include(t => t.TecnicoAsignado)
                .Include(t => t.Categoria)
                .Include(t => t.EstadoTicket)
                .Include(t => t.Prioridad)
                .Where(t => t.Id == ticketId)
                .Select(t => new TicketResponseDto
                {
                    Id = t.Id,
                    Titulo = t.Titulo,
                    Descripcion = t.Descripcion,
                    Solucion = t.Solucion,
                    ComentarioCierre = t.ComentarioCierre,
                    CalificacionSatisfaccion = t.CalificacionSatisfaccion,
                    Impacto = t.Impacto,
                    Urgencia = t.Urgencia,
                    Categoria = t.Categoria != null ? t.Categoria.Nombre : string.Empty,
                    Estado = t.EstadoTicket != null ? t.EstadoTicket.Nombre : string.Empty,
                    Prioridad = t.Prioridad != null ? t.Prioridad.Nombre : string.Empty,
                    UsuarioSolicitante = t.UsuarioSolicitante != null ? t.UsuarioSolicitante.NombreCompleto : string.Empty,
                    TecnicoAsignado = t.TecnicoAsignado != null ? t.TecnicoAsignado.NombreCompleto : null,
                    FechaCreacion = t.FechaCreacion,
                    FechaPrimeraRespuesta = t.FechaPrimeraRespuesta,
                    FechaResolucion = t.FechaResolucion,
                    FechaCierre = t.FechaCierre
                })
                .FirstAsync();
        }

        private async Task<Prioridad?> ObtenerPrioridadAsync(string impacto, string urgencia)
        {
            string impactoNormalizado = NormalizarTexto(impacto);
            string urgenciaNormalizada = NormalizarTexto(urgencia);

            string nombrePrioridad = (impactoNormalizado, urgenciaNormalizada) switch
            {
                ("Alto", "Alta") => "Crítica",
                ("Alto", "Media") => "Alta",
                ("Alto", "Baja") => "Media",

                ("Medio", "Alta") => "Alta",
                ("Medio", "Media") => "Media",
                ("Medio", "Baja") => "Baja",

                ("Bajo", "Alta") => "Media",
                ("Bajo", "Media") => "Baja",
                ("Bajo", "Baja") => "Baja",

                _ => string.Empty
            };

            if (string.IsNullOrWhiteSpace(nombrePrioridad))
            {
                return null;
            }

            return await _context.Prioridades
                .FirstOrDefaultAsync(p => p.Nombre == nombrePrioridad && p.Activo);
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
    }
}