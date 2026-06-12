using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SistemaIncidentes.Api.Data;
using SistemaIncidentes.Api.DTOs;
using SistemaIncidentes.Api.Helpers.Tickets;
using SistemaIncidentes.Api.Models;
using SistemaIncidentes.Api.Services;

namespace SistemaIncidentes.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TicketsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IEmailService _emailService;
        private readonly ITicketComentarioService _comentarioService;
        private readonly ITicketDashboardService _dashboardService;
        private readonly ITicketWorkflowService _workflowService;
        private readonly ILogger<TicketsController> _logger;

        public TicketsController(
            ApplicationDbContext context,
            IEmailService emailService,
            ITicketComentarioService comentarioService,
            ITicketDashboardService dashboardService,
            ITicketWorkflowService workflowService,
            ILogger<TicketsController> logger)
        {
            _context = context;
            _emailService = emailService;
            _comentarioService = comentarioService;
            _dashboardService = dashboardService;
            _workflowService = workflowService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> ListarTickets(
            [FromQuery] string? estado,
            [FromQuery] string? prioridad,
            [FromQuery] int? categoriaId,
            [FromQuery] int? tecnicoId,
            [FromQuery] int? solicitanteId,
            [FromQuery] DateTime? fechaInicio,
            [FromQuery] DateTime? fechaFin)
        {
            var datosUsuario = ObtenerDatosUsuario();

            if (datosUsuario == null)
            {
                return Unauthorized(new { mensaje = "No se pudo identificar al usuario autenticado." });
            }

            var query = ObtenerQueryTicketsPorRol(datosUsuario.Value.UsuarioId, datosUsuario.Value.RolUsuario);

            if (query == null)
            {
                return Forbid();
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
                    return Forbid();
                }

                query = query.Where(t => t.TecnicoAsignadoId == tecnicoId.Value);
            }

            if (solicitanteId.HasValue)
            {
                if (datosUsuario.Value.RolUsuario == "Solicitante" && solicitanteId.Value != datosUsuario.Value.UsuarioId)
                {
                    return Forbid();
                }

                query = query.Where(t => t.UsuarioSolicitanteId == solicitanteId.Value);
            }

            if (fechaInicio.HasValue && fechaFin.HasValue && fechaInicio.Value.Date > fechaFin.Value.Date)
            {
                return BadRequest(new { mensaje = "La fecha de inicio no puede ser mayor que la fecha fin." });
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

            return Ok(new
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

        [HttpGet("dashboard")]
        public async Task<IActionResult> ObtenerDashboardTickets()
        {
            var resultado = await _dashboardService.ObtenerDashboardAsync(User);

            return resultado.CodigoEstado switch
            {
                StatusCodes.Status200OK => Ok(resultado.Respuesta),
                StatusCodes.Status401Unauthorized => Unauthorized(resultado.Respuesta),
                StatusCodes.Status403Forbidden => Forbid(),
                _ => StatusCode(resultado.CodigoEstado, resultado.Respuesta)
            };
        }

        [HttpPost]
        public async Task<IActionResult> CrearTicket([FromBody] CrearTicketDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { mensaje = "Los datos enviados no son válidos.", errores = ModelState });
            }

            var datosUsuario = ObtenerDatosUsuario();

            if (datosUsuario == null)
            {
                return Unauthorized(new { mensaje = "No se pudo identificar al usuario autenticado." });
            }

            var usuario = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.Id == datosUsuario.Value.UsuarioId && u.Activo);

            if (usuario == null)
            {
                return Unauthorized(new { mensaje = "Usuario no encontrado o inactivo." });
            }

            var categoria = await _context.Categorias
                .FirstOrDefaultAsync(c => c.Id == dto.CategoriaId && c.Activo);

            if (categoria == null)
            {
                return BadRequest(new { mensaje = "La categoría seleccionada no existe o se encuentra inactiva." });
            }

            var estadoAbierto = await _context.EstadosTicket
                .FirstOrDefaultAsync(e => e.Nombre == "Abierto" && e.Activo);

            if (estadoAbierto == null)
            {
                return StatusCode(500, new { mensaje = "No se encontró el estado inicial 'Abierto'. Verifique los datos base del sistema." });
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

            return CreatedAtAction(nameof(ObtenerTicketPorId), new { id = ticket.Id }, ticketCreado);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> ObtenerTicketPorId(int id)
        {
            var datosUsuario = ObtenerDatosUsuario();

            if (datosUsuario == null)
            {
                return Unauthorized(new { mensaje = "No se pudo identificar al usuario autenticado." });
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
                return Forbid();
            }

            var ticketEntidad = await query.FirstOrDefaultAsync();

            if (ticketEntidad == null)
            {
                return NotFound(new { mensaje = "Ticket no encontrado o no tiene permisos para consultarlo." });
            }

            return Ok(TicketResponseMapper.ToResponseDto(ticketEntidad));
        }

        [HttpGet("{id:int}/bitacora")]
        public async Task<IActionResult> ObtenerBitacoraTicket(int id)
        {
            var datosUsuario = ObtenerDatosUsuario();

            if (datosUsuario == null)
            {
                return Unauthorized(new { mensaje = "No se pudo identificar al usuario autenticado." });
            }

            if (datosUsuario.Value.RolUsuario == "Solicitante")
            {
                return Forbid();
            }

            var ticket = await _context.Tickets.FirstOrDefaultAsync(t => t.Id == id);

            if (ticket == null)
            {
                return NotFound(new { mensaje = "Ticket no encontrado." });
            }

            if (!UsuarioTienePermisoSobreTicket(ticket, datosUsuario.Value.UsuarioId, datosUsuario.Value.RolUsuario))
            {
                return Forbid();
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

            return Ok(bitacora);
        }

        [HttpGet("{id:int}/comentarios")]
        public async Task<IActionResult> ObtenerComentariosTicket(int id)
        {
            var resultado = await _comentarioService.ObtenerComentariosAsync(id, User);

            return CrearRespuestaServicioComentarios(resultado);
        }

        [HttpPost("{id:int}/comentarios")]
        public async Task<IActionResult> CrearComentarioTicket(int id, [FromBody] CrearComentarioTicketDto dto)
        {
            var resultado = await _comentarioService.CrearComentarioAsync(id, dto, User, ModelState.IsValid);

            if (resultado.Creado && resultado.TicketId.HasValue)
            {
                return CreatedAtAction(nameof(ObtenerComentariosTicket), new { id = resultado.TicketId.Value }, resultado.Respuesta);
            }

            return CrearRespuestaServicioComentarios(resultado);
        }

        [HttpPut("{id:int}/asignar")]
        public async Task<IActionResult> AsignarTicket(int id, [FromBody] AsignarTicketDto dto)
        {
            var resultado = await _workflowService.AsignarTicketAsync(id, dto, User, ModelState.IsValid, ModelState);
            return CrearRespuestaServicioWorkflow(resultado);
        }

        [HttpPut("{id:int}/reclasificar")]
        public async Task<IActionResult> ReclasificarTicket(int id, [FromBody] ReclasificarTicketDto dto)
        {
            var resultado = await _workflowService.ReclasificarTicketAsync(id, dto, User, ModelState.IsValid, ModelState);
            return CrearRespuestaServicioWorkflow(resultado);
        }

        [HttpPut("{id:int}/escalar")]
        public async Task<IActionResult> EscalarTicket(int id, [FromBody] EscalarTicketDto dto)
        {
            var resultado = await _workflowService.EscalarTicketAsync(id, dto, User, ModelState.IsValid, ModelState);
            return CrearRespuestaServicioWorkflow(resultado);
        }

        [HttpPut("{id:int}/cancelar")]
        public async Task<IActionResult> CancelarTicket(int id, [FromBody] CancelarTicketDto dto)
        {
            var resultado = await _workflowService.CancelarTicketAsync(id, dto, User, ModelState.IsValid, ModelState);
            return CrearRespuestaServicioWorkflow(resultado);
        }

        [HttpPut("{id:int}/reabrir")]
        public async Task<IActionResult> ReabrirTicket(int id, [FromBody] ReabrirTicketDto dto)
        {
            var resultado = await _workflowService.ReabrirTicketAsync(id, dto, User, ModelState.IsValid, ModelState);
            return CrearRespuestaServicioWorkflow(resultado);
        }

        [HttpPut("{id:int}/resolver")]
        public async Task<IActionResult> ResolverTicket(int id, [FromBody] ResolverTicketDto dto)
        {
            var resultado = await _workflowService.ResolverTicketAsync(id, dto, User, ModelState.IsValid, ModelState);
            return CrearRespuestaServicioWorkflow(resultado);
        }

        [HttpPut("{id:int}/cerrar")]
        public async Task<IActionResult> CerrarTicket(int id, [FromBody] CerrarTicketDto dto)
        {
            var resultado = await _workflowService.CerrarTicketAsync(id, dto, User, ModelState.IsValid, ModelState);
            return CrearRespuestaServicioWorkflow(resultado);
        }

        private IActionResult CrearRespuestaServicioWorkflow(TicketWorkflowResultado resultado)
        {
            return resultado.CodigoEstado switch
            {
                StatusCodes.Status200OK => Ok(resultado.Respuesta),
                StatusCodes.Status400BadRequest => BadRequest(resultado.Respuesta),
                StatusCodes.Status401Unauthorized => Unauthorized(resultado.Respuesta),
                StatusCodes.Status403Forbidden => Forbid(),
                StatusCodes.Status404NotFound => NotFound(resultado.Respuesta),
                StatusCodes.Status500InternalServerError => StatusCode(StatusCodes.Status500InternalServerError, resultado.Respuesta),
                _ => StatusCode(resultado.CodigoEstado, resultado.Respuesta)
            };
        }

        private IActionResult CrearRespuestaServicioComentarios(ComentarioOperacionResultado resultado)
        {
            return resultado.CodigoEstado switch
            {
                StatusCodes.Status200OK => Ok(resultado.Respuesta),
                StatusCodes.Status400BadRequest => BadRequest(resultado.Respuesta),
                StatusCodes.Status401Unauthorized => Unauthorized(resultado.Respuesta),
                StatusCodes.Status403Forbidden => Forbid(),
                StatusCodes.Status404NotFound => NotFound(resultado.Respuesta),
                StatusCodes.Status500InternalServerError => StatusCode(StatusCodes.Status500InternalServerError, resultado.Respuesta),
                _ => StatusCode(resultado.CodigoEstado, resultado.Respuesta)
            };
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