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

            var ticketCreado = await _context.Tickets
                .Include(t => t.UsuarioSolicitante)
                .Include(t => t.TecnicoAsignado)
                .Include(t => t.Categoria)
                .Include(t => t.EstadoTicket)
                .Include(t => t.Prioridad)
                .Where(t => t.Id == ticket.Id)
                .Select(t => new TicketResponseDto
                {
                    Id = t.Id,
                    Titulo = t.Titulo,
                    Descripcion = t.Descripcion,
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

            return CreatedAtAction(nameof(ObtenerTicketPorId), new { id = ticket.Id }, ticketCreado);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> ObtenerTicketPorId(int id)
        {
            var ticket = await _context.Tickets
                .Include(t => t.UsuarioSolicitante)
                .Include(t => t.TecnicoAsignado)
                .Include(t => t.Categoria)
                .Include(t => t.EstadoTicket)
                .Include(t => t.Prioridad)
                .Where(t => t.Id == id)
                .Select(t => new TicketResponseDto
                {
                    Id = t.Id,
                    Titulo = t.Titulo,
                    Descripcion = t.Descripcion,
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
                    mensaje = "Ticket no encontrado."
                });
            }

            return Ok(ticket);
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