using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SistemaIncidentes.Api.Data;
using SistemaIncidentes.Api.DTOs;
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
        private readonly ILogger<TicketsController> _logger;

        public TicketsController(
            ApplicationDbContext context,
            IEmailService emailService,
            ILogger<TicketsController> logger)
        {
            _context = context;
            _emailService = emailService;
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
                .Select(CrearTicketResponse)
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
            var datosUsuario = ObtenerDatosUsuario();

            if (datosUsuario == null)
            {
                return Unauthorized(new { mensaje = "No se pudo identificar al usuario autenticado." });
            }

            if (datosUsuario.Value.RolUsuario != "Administrador" &&
                datosUsuario.Value.RolUsuario != "Jefe DTI")
            {
                return Forbid();
            }

            var query = ObtenerQueryTicketsPorRol(datosUsuario.Value.UsuarioId, datosUsuario.Value.RolUsuario);

            if (query == null)
            {
                return Forbid();
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

            return Ok(dashboard);
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
                CrearCorreoTicketCreado(usuario.NombreCompleto, ticket, categoria.Nombre, prioridad.Nombre),
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

            return Ok(CrearTicketResponse(ticketEntidad));
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
            var datosUsuario = ObtenerDatosUsuario();

            if (datosUsuario == null)
            {
                return Unauthorized(new { mensaje = "No se pudo identificar al usuario autenticado." });
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

            var queryComentarios = _context.ComentariosTicket
                .Include(c => c.Usuario)
                .ThenInclude(u => u!.Rol)
                .Where(c => c.TicketId == id)
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

            return Ok(comentarios);
        }

        [HttpPost("{id:int}/comentarios")]
        public async Task<IActionResult> CrearComentarioTicket(int id, [FromBody] CrearComentarioTicketDto dto)
        {
            var datosUsuario = ObtenerDatosUsuario();

            if (datosUsuario == null)
            {
                return Unauthorized(new { mensaje = "No se pudo identificar al usuario autenticado." });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(new { mensaje = "Los datos enviados no son válidos.", errores = ModelState });
            }

            if (datosUsuario.Value.RolUsuario == "Solicitante" && dto.EsInterno)
            {
                return BadRequest(new { mensaje = "El solicitante no puede crear comentarios internos." });
            }

            var usuarioComentario = await _context.Usuarios
                .Include(u => u.Rol)
                .FirstOrDefaultAsync(u => u.Id == datosUsuario.Value.UsuarioId && u.Activo);

            if (usuarioComentario == null)
            {
                return Unauthorized(new { mensaje = "Usuario no encontrado o inactivo." });
            }

            var ticket = await _context.Tickets
                .Include(t => t.UsuarioSolicitante)
                .Include(t => t.TecnicoAsignado)
                .Include(t => t.EstadoTicket)
                .Include(t => t.Categoria)
                .Include(t => t.Prioridad)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (ticket == null)
            {
                return NotFound(new { mensaje = "Ticket no encontrado." });
            }

            if (!UsuarioTienePermisoSobreTicket(ticket, datosUsuario.Value.UsuarioId, datosUsuario.Value.RolUsuario))
            {
                return Forbid();
            }

            if (ticket.EstadoTicket == null)
            {
                return StatusCode(500, new { mensaje = "El ticket no tiene un estado válido asociado." });
            }

            if (!EstadoPermiteComentarios(ticket.EstadoTicket.Nombre))
            {
                return BadRequest(new { mensaje = "No se pueden agregar comentarios a tickets cerrados o cancelados." });
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

            await RegistrarBitacoraAsync(
                ticket.Id,
                datosUsuario.Value.UsuarioId,
                comentario.EsInterno ? "Comentario interno agregado" : "Comentario público agregado",
                $"Se agregó un comentario {tipoComentario} al ticket.");

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

            return CreatedAtAction(nameof(ObtenerComentariosTicket), new { id = ticket.Id }, comentarioCreado);
        }

        [HttpPut("{id:int}/asignar")]
        public async Task<IActionResult> AsignarTicket(int id, [FromBody] AsignarTicketDto dto)
        {
            var datosUsuario = ObtenerDatosUsuario();

            if (datosUsuario == null)
            {
                return Unauthorized(new { mensaje = "No se pudo identificar al usuario autenticado." });
            }

            if (datosUsuario.Value.RolUsuario != "Administrador" && datosUsuario.Value.RolUsuario != "Jefe DTI")
            {
                return Forbid();
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(new { mensaje = "Los datos enviados no son válidos.", errores = ModelState });
            }

            var ticket = await _context.Tickets
                .Include(t => t.UsuarioSolicitante)
                .Include(t => t.Categoria)
                .Include(t => t.Prioridad)
                .Include(t => t.EstadoTicket)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (ticket == null)
            {
                return NotFound(new { mensaje = "Ticket no encontrado." });
            }

            if (ticket.EstadoTicket != null &&
                (ticket.EstadoTicket.Nombre == "Cerrado" || ticket.EstadoTicket.Nombre == "Cancelado"))
            {
                return BadRequest(new { mensaje = "No se puede asignar un ticket cerrado o cancelado." });
            }

            var tecnico = await _context.Usuarios
                .Include(u => u.Rol)
                .FirstOrDefaultAsync(u => u.Id == dto.TecnicoId && u.Activo);

            if (tecnico == null)
            {
                return BadRequest(new { mensaje = "El técnico seleccionado no existe o se encuentra inactivo." });
            }

            if (tecnico.Rol == null || tecnico.Rol.Nombre != "Técnico")
            {
                return BadRequest(new { mensaje = "El usuario seleccionado no tiene rol de Técnico." });
            }

            var estadoEnProceso = await _context.EstadosTicket
                .FirstOrDefaultAsync(e => e.Nombre == "En proceso" && e.Activo);

            if (estadoEnProceso == null)
            {
                return StatusCode(500, new { mensaje = "No se encontró el estado 'En proceso'. Verifique los datos base del sistema." });
            }

            ticket.TecnicoAsignadoId = tecnico.Id;
            ticket.EstadoTicketId = estadoEnProceso.Id;

            if (ticket.FechaPrimeraRespuesta == null)
            {
                ticket.FechaPrimeraRespuesta = DateTime.UtcNow;
            }

            await RegistrarBitacoraAsync(
                ticket.Id,
                datosUsuario.Value.UsuarioId,
                "Ticket asignado",
                $"El ticket fue asignado al técnico {tecnico.NombreCompleto} y cambió al estado En proceso.");

            await _context.SaveChangesAsync();

            await EnviarCorreoSeguroAsync(
                tecnico.Correo,
                $"Ticket #{ticket.Id} asignado - {ticket.Titulo}",
                CrearCorreoTicketAsignado(tecnico.NombreCompleto, ticket),
                ticket.Id,
                "Error notificación asignación");

            var ticketActualizado = await ObtenerTicketResponsePorIdAsync(ticket.Id);

            return Ok(new
            {
                mensaje = "Ticket asignado correctamente.",
                ticket = ticketActualizado
            });
        }

        [HttpPut("{id:int}/reclasificar")]
        public async Task<IActionResult> ReclasificarTicket(int id, [FromBody] ReclasificarTicketDto dto)
        {
            var datosUsuario = ObtenerDatosUsuario();

            if (datosUsuario == null)
            {
                return Unauthorized(new { mensaje = "No se pudo identificar al usuario autenticado." });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(new { mensaje = "Los datos enviados no son válidos.", errores = ModelState });
            }

            var ticket = await _context.Tickets
                .Include(t => t.UsuarioSolicitante)
                .Include(t => t.TecnicoAsignado)
                .Include(t => t.EstadoTicket)
                .Include(t => t.Categoria)
                .Include(t => t.Prioridad)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (ticket == null)
            {
                return NotFound(new { mensaje = "Ticket no encontrado." });
            }

            bool esTecnicoAsignado = ticket.TecnicoAsignadoId == datosUsuario.Value.UsuarioId;
            bool esAdministradorOJefe = datosUsuario.Value.RolUsuario == "Administrador" || datosUsuario.Value.RolUsuario == "Jefe DTI";

            if (!esTecnicoAsignado && !esAdministradorOJefe)
            {
                return Forbid();
            }

            if (ticket.EstadoTicket == null)
            {
                return StatusCode(500, new { mensaje = "El ticket no tiene un estado válido asociado." });
            }

            if (ticket.EstadoTicket.Nombre == "Cerrado" || ticket.EstadoTicket.Nombre == "Cancelado")
            {
                return BadRequest(new { mensaje = "No se puede reclasificar un ticket cerrado o cancelado." });
            }

            var nuevaPrioridad = await ObtenerPrioridadAsync(dto.Impacto, dto.Urgencia);

            if (nuevaPrioridad == null)
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

            string impactoAnterior = ticket.Impacto;
            string urgenciaAnterior = ticket.Urgencia;
            string prioridadAnterior = ticket.Prioridad != null ? ticket.Prioridad.Nombre : "Sin prioridad";

            string impactoNuevo = NormalizarTexto(dto.Impacto);
            string urgenciaNueva = NormalizarTexto(dto.Urgencia);

            bool sinCambios =
                impactoAnterior == impactoNuevo &&
                urgenciaAnterior == urgenciaNueva &&
                ticket.PrioridadId == nuevaPrioridad.Id;

            if (sinCambios)
            {
                return BadRequest(new { mensaje = "La clasificación enviada es igual a la clasificación actual del ticket." });
            }

            ticket.Impacto = impactoNuevo;
            ticket.Urgencia = urgenciaNueva;
            ticket.PrioridadId = nuevaPrioridad.Id;

            await RegistrarBitacoraAsync(
                ticket.Id,
                datosUsuario.Value.UsuarioId,
                "Ticket reclasificado",
                $"El ticket fue reclasificado. Impacto anterior: {impactoAnterior}, urgencia anterior: {urgenciaAnterior}, prioridad anterior: {prioridadAnterior}. " +
                $"Nuevo impacto: {ticket.Impacto}, nueva urgencia: {ticket.Urgencia}, nueva prioridad: {nuevaPrioridad.Nombre}. " +
                $"Motivo: {dto.MotivoReclasificacion.Trim()}");

            await _context.SaveChangesAsync();

            if (ticket.UsuarioSolicitante != null)
            {
                await EnviarCorreoSeguroAsync(
                    ticket.UsuarioSolicitante.Correo,
                    $"Ticket #{ticket.Id} reclasificado - {ticket.Titulo}",
                    CrearCorreoTicketReclasificado(
                        ticket.UsuarioSolicitante.NombreCompleto,
                        ticket,
                        impactoAnterior,
                        urgenciaAnterior,
                        prioridadAnterior,
                        nuevaPrioridad.Nombre,
                        dto.MotivoReclasificacion.Trim()),
                    ticket.Id,
                    "Error notificación reclasificación");
            }

            var ticketActualizado = await ObtenerTicketResponsePorIdAsync(ticket.Id);

            return Ok(new
            {
                mensaje = "Ticket reclasificado correctamente.",
                ticket = ticketActualizado
            });
        }

        [HttpPut("{id:int}/escalar")]
        public async Task<IActionResult> EscalarTicket(int id, [FromBody] EscalarTicketDto dto)
        {
            var datosUsuario = ObtenerDatosUsuario();

            if (datosUsuario == null)
            {
                return Unauthorized(new { mensaje = "No se pudo identificar al usuario autenticado." });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(new { mensaje = "Los datos enviados no son válidos.", errores = ModelState });
            }

            var ticket = await _context.Tickets
                .Include(t => t.UsuarioSolicitante)
                .Include(t => t.TecnicoAsignado)
                .Include(t => t.EstadoTicket)
                .Include(t => t.Categoria)
                .Include(t => t.Prioridad)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (ticket == null)
            {
                return NotFound(new { mensaje = "Ticket no encontrado." });
            }

            bool esTecnicoAsignado = ticket.TecnicoAsignadoId == datosUsuario.Value.UsuarioId;
            bool esAdministradorOJefe = datosUsuario.Value.RolUsuario == "Administrador" || datosUsuario.Value.RolUsuario == "Jefe DTI";

            if (!esTecnicoAsignado && !esAdministradorOJefe)
            {
                return Forbid();
            }

            if (ticket.EstadoTicket == null)
            {
                return StatusCode(500, new { mensaje = "El ticket no tiene un estado válido asociado." });
            }

            if (ticket.EstadoTicket.Nombre == "Cerrado")
            {
                return BadRequest(new { mensaje = "No se puede escalar un ticket cerrado." });
            }

            if (ticket.EstadoTicket.Nombre == "Cancelado")
            {
                return BadRequest(new { mensaje = "No se puede escalar un ticket cancelado." });
            }

            if (ticket.EstadoTicket.Nombre == "Resuelto")
            {
                return BadRequest(new { mensaje = "No se puede escalar un ticket resuelto. Si el incidente continúa, debe reabrirse o crearse un nuevo ticket." });
            }

            if (ticket.EstadoTicket.Nombre == "Escalado")
            {
                return BadRequest(new { mensaje = "El ticket ya se encuentra escalado." });
            }

            if (ticket.EstadoTicket.Nombre == "Abierto")
            {
                return BadRequest(new { mensaje = "No se puede escalar un ticket abierto. Primero debe asignarse a un técnico y pasar a estado 'En proceso'." });
            }

            if (ticket.EstadoTicket.Nombre != "En proceso")
            {
                return BadRequest(new { mensaje = $"No se puede escalar un ticket en estado '{ticket.EstadoTicket.Nombre}'." });
            }

            if (ticket.TecnicoAsignadoId == null)
            {
                return BadRequest(new { mensaje = "No se puede escalar un ticket sin técnico asignado." });
            }

            var estadoEscalado = await _context.EstadosTicket
                .FirstOrDefaultAsync(e => e.Nombre == "Escalado" && e.Activo);

            if (estadoEscalado == null)
            {
                return StatusCode(500, new { mensaje = "No se encontró el estado 'Escalado'. Verifique los datos base del sistema." });
            }

            ticket.EstadoTicketId = estadoEscalado.Id;
            ticket.MotivoEscalamiento = dto.MotivoEscalamiento.Trim();
            ticket.FechaEscalamiento = DateTime.UtcNow;

            await RegistrarBitacoraAsync(
                ticket.Id,
                datosUsuario.Value.UsuarioId,
                "Ticket escalado",
                "El ticket fue escalado. Motivo: " + ticket.MotivoEscalamiento);

            await _context.SaveChangesAsync();

            if (ticket.UsuarioSolicitante != null)
            {
                await EnviarCorreoSeguroAsync(
                    ticket.UsuarioSolicitante.Correo,
                    $"Ticket #{ticket.Id} escalado - {ticket.Titulo}",
                    CrearCorreoCambioEstado(ticket.UsuarioSolicitante.NombreCompleto, ticket, "Escalado", ticket.MotivoEscalamiento),
                    ticket.Id,
                    "Error notificación escalamiento");
            }

            var ticketActualizado = await ObtenerTicketResponsePorIdAsync(ticket.Id);

            return Ok(new
            {
                mensaje = "Ticket escalado correctamente.",
                ticket = ticketActualizado
            });
        }

        [HttpPut("{id:int}/cancelar")]
        public async Task<IActionResult> CancelarTicket(int id, [FromBody] CancelarTicketDto dto)
        {
            var datosUsuario = ObtenerDatosUsuario();

            if (datosUsuario == null)
            {
                return Unauthorized(new { mensaje = "No se pudo identificar al usuario autenticado." });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(new { mensaje = "Los datos enviados no son válidos.", errores = ModelState });
            }

            var ticket = await _context.Tickets
                .Include(t => t.UsuarioSolicitante)
                .Include(t => t.TecnicoAsignado)
                .Include(t => t.EstadoTicket)
                .Include(t => t.Categoria)
                .Include(t => t.Prioridad)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (ticket == null)
            {
                return NotFound(new { mensaje = "Ticket no encontrado." });
            }

            if (ticket.EstadoTicket == null)
            {
                return StatusCode(500, new { mensaje = "El ticket no tiene un estado válido asociado." });
            }

            bool esSolicitanteDuenio = ticket.UsuarioSolicitanteId == datosUsuario.Value.UsuarioId;
            bool esAdministradorOJefe = datosUsuario.Value.RolUsuario == "Administrador" || datosUsuario.Value.RolUsuario == "Jefe DTI";

            if (!esSolicitanteDuenio && !esAdministradorOJefe)
            {
                return Forbid();
            }

            if (ticket.EstadoTicket.Nombre == "Cancelado")
            {
                return BadRequest(new { mensaje = "El ticket ya se encuentra cancelado." });
            }

            if (ticket.EstadoTicket.Nombre == "Cerrado")
            {
                return BadRequest(new { mensaje = "No se puede cancelar un ticket cerrado." });
            }

            if (ticket.EstadoTicket.Nombre == "Resuelto")
            {
                return BadRequest(new { mensaje = "No se puede cancelar un ticket resuelto. Debe cerrarse formalmente o revisarse mediante un nuevo flujo." });
            }

            if (datosUsuario.Value.RolUsuario == "Solicitante" && ticket.EstadoTicket.Nombre != "Abierto")
            {
                return BadRequest(new { mensaje = "El solicitante solo puede cancelar tickets que aún estén en estado 'Abierto'." });
            }

            var estadoCancelado = await _context.EstadosTicket
                .FirstOrDefaultAsync(e => e.Nombre == "Cancelado" && e.Activo);

            if (estadoCancelado == null)
            {
                return StatusCode(500, new { mensaje = "No se encontró el estado 'Cancelado'. Verifique los datos base del sistema." });
            }

            ticket.EstadoTicketId = estadoCancelado.Id;
            ticket.MotivoCancelacion = dto.MotivoCancelacion.Trim();
            ticket.FechaCancelacion = DateTime.UtcNow;

            await RegistrarBitacoraAsync(
                ticket.Id,
                datosUsuario.Value.UsuarioId,
                "Ticket cancelado",
                "El ticket fue cancelado. Motivo: " + ticket.MotivoCancelacion);

            await _context.SaveChangesAsync();

            if (ticket.UsuarioSolicitante != null)
            {
                await EnviarCorreoSeguroAsync(
                    ticket.UsuarioSolicitante.Correo,
                    $"Ticket #{ticket.Id} cancelado - {ticket.Titulo}",
                    CrearCorreoCambioEstado(ticket.UsuarioSolicitante.NombreCompleto, ticket, "Cancelado", ticket.MotivoCancelacion),
                    ticket.Id,
                    "Error notificación cancelación");
            }

            var ticketActualizado = await ObtenerTicketResponsePorIdAsync(ticket.Id);

            return Ok(new
            {
                mensaje = "Ticket cancelado correctamente.",
                ticket = ticketActualizado
            });
        }

        [HttpPut("{id:int}/reabrir")]
        public async Task<IActionResult> ReabrirTicket(int id, [FromBody] ReabrirTicketDto dto)
        {
            var datosUsuario = ObtenerDatosUsuario();

            if (datosUsuario == null)
            {
                return Unauthorized(new { mensaje = "No se pudo identificar al usuario autenticado." });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(new { mensaje = "Los datos enviados no son válidos.", errores = ModelState });
            }

            var ticket = await _context.Tickets
                .Include(t => t.UsuarioSolicitante)
                .Include(t => t.TecnicoAsignado)
                .Include(t => t.EstadoTicket)
                .Include(t => t.Categoria)
                .Include(t => t.Prioridad)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (ticket == null)
            {
                return NotFound(new { mensaje = "Ticket no encontrado." });
            }

            if (ticket.EstadoTicket == null)
            {
                return StatusCode(500, new { mensaje = "El ticket no tiene un estado válido asociado." });
            }

            bool esSolicitanteDuenio = ticket.UsuarioSolicitanteId == datosUsuario.Value.UsuarioId;
            bool esAdministradorOJefe = datosUsuario.Value.RolUsuario == "Administrador" || datosUsuario.Value.RolUsuario == "Jefe DTI";

            if (!esSolicitanteDuenio && !esAdministradorOJefe)
            {
                return Forbid();
            }

            if (ticket.EstadoTicket.Nombre == "Cancelado")
            {
                return BadRequest(new { mensaje = "No se puede reabrir un ticket cancelado." });
            }

            if (ticket.EstadoTicket.Nombre == "Abierto")
            {
                return BadRequest(new { mensaje = "El ticket ya se encuentra abierto." });
            }

            if (ticket.EstadoTicket.Nombre == "En proceso")
            {
                return BadRequest(new { mensaje = "No se puede reabrir un ticket que ya está en proceso." });
            }

            if (ticket.EstadoTicket.Nombre == "Escalado")
            {
                return BadRequest(new { mensaje = "No se puede reabrir un ticket escalado." });
            }

            if (ticket.EstadoTicket.Nombre != "Resuelto" && ticket.EstadoTicket.Nombre != "Cerrado")
            {
                return BadRequest(new { mensaje = $"No se puede reabrir un ticket en estado '{ticket.EstadoTicket.Nombre}'." });
            }

            var estadoAbierto = await _context.EstadosTicket
                .FirstOrDefaultAsync(e => e.Nombre == "Abierto" && e.Activo);

            if (estadoAbierto == null)
            {
                return StatusCode(500, new { mensaje = "No se encontró el estado 'Abierto'. Verifique los datos base del sistema." });
            }

            ticket.EstadoTicketId = estadoAbierto.Id;
            ticket.MotivoReapertura = dto.MotivoReapertura.Trim();
            ticket.FechaReapertura = DateTime.UtcNow;
            ticket.FechaResolucion = null;
            ticket.FechaCierre = null;
            ticket.ComentarioCierre = null;
            ticket.CalificacionSatisfaccion = null;

            await RegistrarBitacoraAsync(
                ticket.Id,
                datosUsuario.Value.UsuarioId,
                "Ticket reabierto",
                "El ticket fue reabierto y cambió nuevamente al estado Abierto. Motivo: " + ticket.MotivoReapertura);

            await _context.SaveChangesAsync();

            if (ticket.UsuarioSolicitante != null)
            {
                await EnviarCorreoSeguroAsync(
                    ticket.UsuarioSolicitante.Correo,
                    $"Ticket #{ticket.Id} reabierto - {ticket.Titulo}",
                    CrearCorreoCambioEstado(ticket.UsuarioSolicitante.NombreCompleto, ticket, "Abierto", ticket.MotivoReapertura),
                    ticket.Id,
                    "Error notificación reapertura");
            }

            var ticketActualizado = await ObtenerTicketResponsePorIdAsync(ticket.Id);

            return Ok(new
            {
                mensaje = "Ticket reabierto correctamente.",
                ticket = ticketActualizado
            });
        }

        [HttpPut("{id:int}/resolver")]
        public async Task<IActionResult> ResolverTicket(int id, [FromBody] ResolverTicketDto dto)
        {
            var datosUsuario = ObtenerDatosUsuario();

            if (datosUsuario == null)
            {
                return Unauthorized(new { mensaje = "No se pudo identificar al usuario autenticado." });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(new { mensaje = "Los datos enviados no son válidos.", errores = ModelState });
            }

            var ticket = await _context.Tickets
                .Include(t => t.UsuarioSolicitante)
                .Include(t => t.TecnicoAsignado)
                .Include(t => t.EstadoTicket)
                .Include(t => t.Categoria)
                .Include(t => t.Prioridad)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (ticket == null)
            {
                return NotFound(new { mensaje = "Ticket no encontrado." });
            }

            bool esTecnicoAsignado = ticket.TecnicoAsignadoId == datosUsuario.Value.UsuarioId;
            bool esAdministradorOJefe = datosUsuario.Value.RolUsuario == "Administrador" || datosUsuario.Value.RolUsuario == "Jefe DTI";

            if (!esTecnicoAsignado && !esAdministradorOJefe)
            {
                return Forbid();
            }

            if (ticket.EstadoTicket == null ||
                (ticket.EstadoTicket.Nombre != "En proceso" && ticket.EstadoTicket.Nombre != "Escalado"))
            {
                return BadRequest(new { mensaje = "Solo se pueden resolver tickets que estén en estado 'En proceso' o 'Escalado'." });
            }

            var estadoResuelto = await _context.EstadosTicket
                .FirstOrDefaultAsync(e => e.Nombre == "Resuelto" && e.Activo);

            if (estadoResuelto == null)
            {
                return StatusCode(500, new { mensaje = "No se encontró el estado 'Resuelto'. Verifique los datos base del sistema." });
            }

            ticket.Solucion = dto.Solucion.Trim();
            ticket.EstadoTicketId = estadoResuelto.Id;
            ticket.FechaResolucion = DateTime.UtcNow;

            await RegistrarBitacoraAsync(
                ticket.Id,
                datosUsuario.Value.UsuarioId,
                "Ticket resuelto",
                "El ticket fue marcado como Resuelto y se registró la solución aplicada.");

            await _context.SaveChangesAsync();

            if (ticket.UsuarioSolicitante != null)
            {
                await EnviarCorreoSeguroAsync(
                    ticket.UsuarioSolicitante.Correo,
                    $"Ticket #{ticket.Id} resuelto - {ticket.Titulo}",
                    CrearCorreoTicketResuelto(ticket.UsuarioSolicitante.NombreCompleto, ticket),
                    ticket.Id,
                    "Error notificación resolución");
            }

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
            var datosUsuario = ObtenerDatosUsuario();

            if (datosUsuario == null)
            {
                return Unauthorized(new { mensaje = "No se pudo identificar al usuario autenticado." });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(new { mensaje = "Los datos enviados no son válidos.", errores = ModelState });
            }

            var ticket = await _context.Tickets
                .Include(t => t.UsuarioSolicitante)
                .Include(t => t.TecnicoAsignado)
                .Include(t => t.EstadoTicket)
                .Include(t => t.Categoria)
                .Include(t => t.Prioridad)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (ticket == null)
            {
                return NotFound(new { mensaje = "Ticket no encontrado." });
            }

            bool esSolicitanteDuenio = ticket.UsuarioSolicitanteId == datosUsuario.Value.UsuarioId;
            bool esAdministradorOJefe = datosUsuario.Value.RolUsuario == "Administrador" || datosUsuario.Value.RolUsuario == "Jefe DTI";

            if (!esSolicitanteDuenio && !esAdministradorOJefe)
            {
                return Forbid();
            }

            if (ticket.EstadoTicket == null || ticket.EstadoTicket.Nombre != "Resuelto")
            {
                return BadRequest(new { mensaje = "Solo se pueden cerrar tickets que estén en estado 'Resuelto'." });
            }

            var estadoCerrado = await _context.EstadosTicket
                .FirstOrDefaultAsync(e => e.Nombre == "Cerrado" && e.Activo);

            if (estadoCerrado == null)
            {
                return StatusCode(500, new { mensaje = "No se encontró el estado 'Cerrado'. Verifique los datos base del sistema." });
            }

            ticket.EstadoTicketId = estadoCerrado.Id;
            ticket.FechaCierre = DateTime.UtcNow;
            ticket.ComentarioCierre = string.IsNullOrWhiteSpace(dto.ComentarioCierre)
                ? null
                : dto.ComentarioCierre.Trim();
            ticket.CalificacionSatisfaccion = dto.CalificacionSatisfaccion;

            await RegistrarBitacoraAsync(
                ticket.Id,
                datosUsuario.Value.UsuarioId,
                "Ticket cerrado",
                $"El ticket fue cerrado formalmente. Calificación de satisfacción: {(dto.CalificacionSatisfaccion.HasValue ? dto.CalificacionSatisfaccion.Value.ToString() : "No registrada")}.");

            await _context.SaveChangesAsync();

            if (ticket.UsuarioSolicitante != null)
            {
                await EnviarCorreoSeguroAsync(
                    ticket.UsuarioSolicitante.Correo,
                    $"Ticket #{ticket.Id} cerrado - {ticket.Titulo}",
                    CrearCorreoCambioEstado(ticket.UsuarioSolicitante.NombreCompleto, ticket, "Cerrado", ticket.ComentarioCierre),
                    ticket.Id,
                    "Error notificación cierre");
            }

            var ticketActualizado = await ObtenerTicketResponsePorIdAsync(ticket.Id);

            return Ok(new
            {
                mensaje = "Ticket cerrado correctamente.",
                ticket = ticketActualizado
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

            return CrearTicketResponse(ticket);
        }

        private static TicketResponseDto CrearTicketResponse(Ticket t)
        {
            return new TicketResponseDto
            {
                Id = t.Id,
                Titulo = t.Titulo,
                Descripcion = t.Descripcion,
                Solucion = t.Solucion,
                ComentarioCierre = t.ComentarioCierre,
                CalificacionSatisfaccion = t.CalificacionSatisfaccion,
                MotivoEscalamiento = t.MotivoEscalamiento,
                FechaEscalamiento = t.FechaEscalamiento,
                MotivoCancelacion = t.MotivoCancelacion,
                FechaCancelacion = t.FechaCancelacion,
                MotivoReapertura = t.MotivoReapertura,
                FechaReapertura = t.FechaReapertura,
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
            };
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

        private async Task<Prioridad?> ObtenerPrioridadAsync(string impacto, string urgencia)
        {
            string impactoNormalizado = NormalizarTexto(impacto);
            string urgenciaNormalizada = NormalizarTexto(urgencia);

            string nombrePrioridad = (impactoNormalizado, urgenciaNormalizada) switch
            {
                ("Alto", "Alta") => "Critica",
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
                    CrearCorreoComentario(
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

        private static string CrearCorreoTicketCreado(string nombreSolicitante, Ticket ticket, string categoria, string prioridad)
        {
            return CrearPlantillaCorreo(
                "Ticket registrado correctamente",
                nombreSolicitante,
                $@"
                    <p>Su ticket fue registrado correctamente en la mesa de ayuda.</p>
                    <p><strong>Número de ticket:</strong> #{ticket.Id}</p>
                    <p><strong>Título:</strong> {EscaparHtml(ticket.Titulo)}</p>
                    <p><strong>Categoría:</strong> {EscaparHtml(categoria)}</p>
                    <p><strong>Prioridad:</strong> {EscaparHtml(prioridad)}</p>
                    <p><strong>Estado actual:</strong> Abierto</p>
                ");
        }

        private static string CrearCorreoTicketAsignado(string nombreTecnico, Ticket ticket)
        {
            return CrearPlantillaCorreo(
                "Nuevo ticket asignado",
                nombreTecnico,
                $@"
                    <p>Se le ha asignado un ticket para atención técnica.</p>
                    <p><strong>Número de ticket:</strong> #{ticket.Id}</p>
                    <p><strong>Título:</strong> {EscaparHtml(ticket.Titulo)}</p>
                    <p><strong>Solicitante:</strong> {EscaparHtml(ticket.UsuarioSolicitante?.NombreCompleto ?? "Sin solicitante")}</p>
                    <p><strong>Categoría:</strong> {EscaparHtml(ticket.Categoria?.Nombre ?? "Sin categoría")}</p>
                    <p><strong>Prioridad:</strong> {EscaparHtml(ticket.Prioridad?.Nombre ?? "Sin prioridad")}</p>
                    <p><strong>Estado actual:</strong> En proceso</p>
                ");
        }

        private static string CrearCorreoTicketResuelto(string nombreSolicitante, Ticket ticket)
        {
            return CrearPlantillaCorreo(
                "Ticket resuelto",
                nombreSolicitante,
                $@"
                    <p>Su ticket fue marcado como resuelto por el equipo de soporte.</p>
                    <p><strong>Número de ticket:</strong> #{ticket.Id}</p>
                    <p><strong>Título:</strong> {EscaparHtml(ticket.Titulo)}</p>
                    <p><strong>Solución registrada:</strong></p>
                    <p>{EscaparHtml(ticket.Solucion ?? "Solución no especificada.")}</p>
                    <p>Si la solución es correcta, el ticket podrá cerrarse formalmente.</p>
                ");
        }

        private static string CrearCorreoCambioEstado(string nombreDestinatario, Ticket ticket, string estado, string? detalle)
        {
            return CrearPlantillaCorreo(
                $"Ticket {estado.ToLower()}",
                nombreDestinatario,
                $@"
                    <p>El estado de su ticket fue actualizado.</p>
                    <p><strong>Número de ticket:</strong> #{ticket.Id}</p>
                    <p><strong>Título:</strong> {EscaparHtml(ticket.Titulo)}</p>
                    <p><strong>Nuevo estado:</strong> {EscaparHtml(estado)}</p>
                    {(string.IsNullOrWhiteSpace(detalle) ? string.Empty : $"<p><strong>Detalle:</strong> {EscaparHtml(detalle)}</p>")}
                ");
        }

        private static string CrearCorreoTicketReclasificado(
            string nombreSolicitante,
            Ticket ticket,
            string impactoAnterior,
            string urgenciaAnterior,
            string prioridadAnterior,
            string nuevaPrioridad,
            string motivo)
        {
            return CrearPlantillaCorreo(
                "Ticket reclasificado",
                nombreSolicitante,
                $@"
                    <p>La clasificación de su ticket fue revisada por el equipo de soporte.</p>
                    <p><strong>Número de ticket:</strong> #{ticket.Id}</p>
                    <p><strong>Título:</strong> {EscaparHtml(ticket.Titulo)}</p>
                    <p><strong>Impacto anterior:</strong> {EscaparHtml(impactoAnterior)}</p>
                    <p><strong>Urgencia anterior:</strong> {EscaparHtml(urgenciaAnterior)}</p>
                    <p><strong>Prioridad anterior:</strong> {EscaparHtml(prioridadAnterior)}</p>
                    <p><strong>Nuevo impacto:</strong> {EscaparHtml(ticket.Impacto)}</p>
                    <p><strong>Nueva urgencia:</strong> {EscaparHtml(ticket.Urgencia)}</p>
                    <p><strong>Nueva prioridad:</strong> {EscaparHtml(nuevaPrioridad)}</p>
                    <p><strong>Motivo de reclasificación:</strong> {EscaparHtml(motivo)}</p>
                ");
        }

        private static string CrearCorreoComentario(
            string nombreDestinatario,
            Ticket ticket,
            ComentarioTicket comentario,
            string nombreAutor,
            string rolAutor)
        {
            string tipoComentario = comentario.EsInterno ? "interno" : "público";

            return CrearPlantillaCorreo(
                $"Nuevo comentario {tipoComentario}",
                nombreDestinatario,
                $@"
                    <p>Se agregó un comentario {EscaparHtml(tipoComentario)} al ticket.</p>
                    <p><strong>Número de ticket:</strong> #{ticket.Id}</p>
                    <p><strong>Título:</strong> {EscaparHtml(ticket.Titulo)}</p>
                    <p><strong>Autor:</strong> {EscaparHtml(nombreAutor)} ({EscaparHtml(rolAutor)})</p>
                    <p><strong>Comentario:</strong></p>
                    <p>{EscaparHtml(comentario.Comentario)}</p>
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