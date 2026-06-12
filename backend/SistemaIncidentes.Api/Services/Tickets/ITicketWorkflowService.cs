using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using SistemaIncidentes.Api.DTOs;

namespace SistemaIncidentes.Api.Services
{
    public interface ITicketWorkflowService
    {
        Task<TicketWorkflowResultado> AsignarTicketAsync(int id, AsignarTicketDto dto, ClaimsPrincipal user, bool modelStateIsValid, object? erroresValidacion);
        Task<TicketWorkflowResultado> ReclasificarTicketAsync(int id, ReclasificarTicketDto dto, ClaimsPrincipal user, bool modelStateIsValid, object? erroresValidacion);
        Task<TicketWorkflowResultado> EscalarTicketAsync(int id, EscalarTicketDto dto, ClaimsPrincipal user, bool modelStateIsValid, object? erroresValidacion);
        Task<TicketWorkflowResultado> CancelarTicketAsync(int id, CancelarTicketDto dto, ClaimsPrincipal user, bool modelStateIsValid, object? erroresValidacion);
        Task<TicketWorkflowResultado> ReabrirTicketAsync(int id, ReabrirTicketDto dto, ClaimsPrincipal user, bool modelStateIsValid, object? erroresValidacion);
        Task<TicketWorkflowResultado> ResolverTicketAsync(int id, ResolverTicketDto dto, ClaimsPrincipal user, bool modelStateIsValid, object? erroresValidacion);
        Task<TicketWorkflowResultado> CerrarTicketAsync(int id, CerrarTicketDto dto, ClaimsPrincipal user, bool modelStateIsValid, object? erroresValidacion);
    }

    public class TicketWorkflowResultado
    {
        public int CodigoEstado { get; set; }
        public object? Respuesta { get; set; }

        public static TicketWorkflowResultado Ok(object respuesta)
        {
            return new TicketWorkflowResultado
            {
                CodigoEstado = StatusCodes.Status200OK,
                Respuesta = respuesta
            };
        }

        public static TicketWorkflowResultado BadRequest(object respuesta)
        {
            return new TicketWorkflowResultado
            {
                CodigoEstado = StatusCodes.Status400BadRequest,
                Respuesta = respuesta
            };
        }

        public static TicketWorkflowResultado Unauthorized(object respuesta)
        {
            return new TicketWorkflowResultado
            {
                CodigoEstado = StatusCodes.Status401Unauthorized,
                Respuesta = respuesta
            };
        }

        public static TicketWorkflowResultado Forbidden()
        {
            return new TicketWorkflowResultado
            {
                CodigoEstado = StatusCodes.Status403Forbidden
            };
        }

        public static TicketWorkflowResultado NotFound(object respuesta)
        {
            return new TicketWorkflowResultado
            {
                CodigoEstado = StatusCodes.Status404NotFound,
                Respuesta = respuesta
            };
        }

        public static TicketWorkflowResultado InternalServerError(object respuesta)
        {
            return new TicketWorkflowResultado
            {
                CodigoEstado = StatusCodes.Status500InternalServerError,
                Respuesta = respuesta
            };
        }
    }
}
