using System.Security.Claims;
using Microsoft.AspNetCore.Http;

namespace SistemaIncidentes.Api.Services
{
    public interface ITicketDashboardService
    {
        Task<DashboardOperacionResultado> ObtenerDashboardAsync(ClaimsPrincipal user);
    }

    public class DashboardOperacionResultado
    {
        public int CodigoEstado { get; set; }
        public object? Respuesta { get; set; }

        public static DashboardOperacionResultado Ok(object respuesta)
        {
            return new DashboardOperacionResultado
            {
                CodigoEstado = StatusCodes.Status200OK,
                Respuesta = respuesta
            };
        }

        public static DashboardOperacionResultado Unauthorized(object respuesta)
        {
            return new DashboardOperacionResultado
            {
                CodigoEstado = StatusCodes.Status401Unauthorized,
                Respuesta = respuesta
            };
        }

        public static DashboardOperacionResultado Forbidden()
        {
            return new DashboardOperacionResultado
            {
                CodigoEstado = StatusCodes.Status403Forbidden
            };
        }
    }
}