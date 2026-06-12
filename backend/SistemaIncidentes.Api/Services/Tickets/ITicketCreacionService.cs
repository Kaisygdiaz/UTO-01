using System.Security.Claims;
using SistemaIncidentes.Api.DTOs;

namespace SistemaIncidentes.Api.Services
{
    public interface ITicketCreacionService
    {
        Task<TicketOperacionResultado> CrearTicketAsync(
            CrearTicketDto dto,
            ClaimsPrincipal user,
            bool modeloValido,
            object? erroresValidacion);
    }
}
