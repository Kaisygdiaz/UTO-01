using Microsoft.AspNetCore.Http;
using System.Security.Claims;
using SistemaIncidentes.Api.DTOs;

namespace SistemaIncidentes.Api.Services
{
    public interface ITicketComentarioService
    {
        Task<ComentarioOperacionResultado> ObtenerComentariosAsync(int ticketId, ClaimsPrincipal user);

        Task<ComentarioOperacionResultado> CrearComentarioAsync(
            int ticketId,
            CrearComentarioTicketDto dto,
            ClaimsPrincipal user,
            bool modeloValido);
    }

    public class ComentarioOperacionResultado
    {
        public int CodigoEstado { get; set; }
        public object? Respuesta { get; set; }
        public bool Creado { get; set; }
        public int? TicketId { get; set; }

        public static ComentarioOperacionResultado Ok(object respuesta)
        {
            return new ComentarioOperacionResultado
            {
                CodigoEstado = StatusCodes.Status200OK,
                Respuesta = respuesta
            };
        }

        public static ComentarioOperacionResultado Created(int ticketId, object respuesta)
        {
            return new ComentarioOperacionResultado
            {
                CodigoEstado = StatusCodes.Status201Created,
                Respuesta = respuesta,
                Creado = true,
                TicketId = ticketId
            };
        }

        public static ComentarioOperacionResultado BadRequest(object respuesta)
        {
            return new ComentarioOperacionResultado
            {
                CodigoEstado = StatusCodes.Status400BadRequest,
                Respuesta = respuesta
            };
        }

        public static ComentarioOperacionResultado Unauthorized(object respuesta)
        {
            return new ComentarioOperacionResultado
            {
                CodigoEstado = StatusCodes.Status401Unauthorized,
                Respuesta = respuesta
            };
        }

        public static ComentarioOperacionResultado Forbidden()
        {
            return new ComentarioOperacionResultado
            {
                CodigoEstado = StatusCodes.Status403Forbidden
            };
        }

        public static ComentarioOperacionResultado NotFound(object respuesta)
        {
            return new ComentarioOperacionResultado
            {
                CodigoEstado = StatusCodes.Status404NotFound,
                Respuesta = respuesta
            };
        }

        public static ComentarioOperacionResultado Error(object respuesta)
        {
            return new ComentarioOperacionResultado
            {
                CodigoEstado = StatusCodes.Status500InternalServerError,
                Respuesta = respuesta
            };
        }
    }
}
