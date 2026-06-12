using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using SistemaIncidentes.Api.DTOs;

namespace SistemaIncidentes.Api.Services
{
    public interface ITicketConsultaService
    {
        Task<TicketOperacionResultado> ListarTicketsAsync(
            ClaimsPrincipal user,
            string? estado,
            string? prioridad,
            int? categoriaId,
            int? tecnicoId,
            int? solicitanteId,
            DateTime? fechaInicio,
            DateTime? fechaFin);

        Task<TicketOperacionResultado> ObtenerTicketPorIdAsync(int id, ClaimsPrincipal user);

        Task<TicketOperacionResultado> ObtenerBitacoraTicketAsync(int id, ClaimsPrincipal user);
    }

    public class TicketOperacionResultado
    {
        public int CodigoEstado { get; set; }
        public object? Respuesta { get; set; }
        public bool Creado { get; set; }
        public int? TicketId { get; set; }

        public static TicketOperacionResultado Ok(object respuesta)
        {
            return new TicketOperacionResultado
            {
                CodigoEstado = StatusCodes.Status200OK,
                Respuesta = respuesta
            };
        }

        public static TicketOperacionResultado Created(int ticketId, object respuesta)
        {
            return new TicketOperacionResultado
            {
                CodigoEstado = StatusCodes.Status201Created,
                Respuesta = respuesta,
                Creado = true,
                TicketId = ticketId
            };
        }

        public static TicketOperacionResultado BadRequest(object respuesta)
        {
            return new TicketOperacionResultado
            {
                CodigoEstado = StatusCodes.Status400BadRequest,
                Respuesta = respuesta
            };
        }

        public static TicketOperacionResultado Unauthorized(object respuesta)
        {
            return new TicketOperacionResultado
            {
                CodigoEstado = StatusCodes.Status401Unauthorized,
                Respuesta = respuesta
            };
        }

        public static TicketOperacionResultado Forbidden()
        {
            return new TicketOperacionResultado
            {
                CodigoEstado = StatusCodes.Status403Forbidden
            };
        }

        public static TicketOperacionResultado NotFound(object respuesta)
        {
            return new TicketOperacionResultado
            {
                CodigoEstado = StatusCodes.Status404NotFound,
                Respuesta = respuesta
            };
        }

        public static TicketOperacionResultado Error(object respuesta)
        {
            return new TicketOperacionResultado
            {
                CodigoEstado = StatusCodes.Status500InternalServerError,
                Respuesta = respuesta
            };
        }
    }
}
