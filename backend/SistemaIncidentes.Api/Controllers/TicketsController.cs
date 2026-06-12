using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SistemaIncidentes.Api.DTOs;
using SistemaIncidentes.Api.Services;

namespace SistemaIncidentes.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TicketsController : ControllerBase
    {
        private readonly ITicketConsultaService _consultaService;
        private readonly ITicketCreacionService _creacionService;
        private readonly ITicketComentarioService _comentarioService;
        private readonly ITicketDashboardService _dashboardService;
        private readonly ITicketWorkflowService _workflowService;

        public TicketsController(
            ITicketConsultaService consultaService,
            ITicketCreacionService creacionService,
            ITicketComentarioService comentarioService,
            ITicketDashboardService dashboardService,
            ITicketWorkflowService workflowService)
        {
            _consultaService = consultaService;
            _creacionService = creacionService;
            _comentarioService = comentarioService;
            _dashboardService = dashboardService;
            _workflowService = workflowService;
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
            var resultado = await _consultaService.ListarTicketsAsync(
                User,
                estado,
                prioridad,
                categoriaId,
                tecnicoId,
                solicitanteId,
                fechaInicio,
                fechaFin);

            return CrearRespuestaServicioTickets(resultado);
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
            var resultado = await _creacionService.CrearTicketAsync(dto, User, ModelState.IsValid, ModelState);

            if (resultado.Creado && resultado.TicketId.HasValue)
            {
                return CreatedAtAction(nameof(ObtenerTicketPorId), new { id = resultado.TicketId.Value }, resultado.Respuesta);
            }

            return CrearRespuestaServicioTickets(resultado);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> ObtenerTicketPorId(int id)
        {
            var resultado = await _consultaService.ObtenerTicketPorIdAsync(id, User);
            return CrearRespuestaServicioTickets(resultado);
        }

        [HttpGet("{id:int}/bitacora")]
        public async Task<IActionResult> ObtenerBitacoraTicket(int id)
        {
            var resultado = await _consultaService.ObtenerBitacoraTicketAsync(id, User);
            return CrearRespuestaServicioTickets(resultado);
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

        private IActionResult CrearRespuestaServicioTickets(TicketOperacionResultado resultado)
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
    }
}
