using SistemaIncidentes.Api.DTOs;
using SistemaIncidentes.Api.Models;

namespace SistemaIncidentes.Api.Helpers.Tickets
{
    public static class TicketResponseMapper
    {
        public static TicketResponseDto ToResponseDto(Ticket ticket)
        {
            return new TicketResponseDto
            {
                Id = ticket.Id,
                Titulo = ticket.Titulo,
                Descripcion = ticket.Descripcion,
                Solucion = ticket.Solucion,
                ComentarioCierre = ticket.ComentarioCierre,
                CalificacionSatisfaccion = ticket.CalificacionSatisfaccion,
                MotivoEscalamiento = ticket.MotivoEscalamiento,
                FechaEscalamiento = ticket.FechaEscalamiento,
                MotivoCancelacion = ticket.MotivoCancelacion,
                FechaCancelacion = ticket.FechaCancelacion,
                MotivoReapertura = ticket.MotivoReapertura,
                FechaReapertura = ticket.FechaReapertura,
                Impacto = ticket.Impacto,
                Urgencia = ticket.Urgencia,
                Categoria = ticket.Categoria != null ? ticket.Categoria.Nombre : string.Empty,
                Estado = ticket.EstadoTicket != null ? ticket.EstadoTicket.Nombre : string.Empty,
                Prioridad = ticket.Prioridad != null ? ticket.Prioridad.Nombre : string.Empty,
                UsuarioSolicitante = ticket.UsuarioSolicitante != null
                    ? ticket.UsuarioSolicitante.NombreCompleto
                    : string.Empty,
                TecnicoAsignado = ticket.TecnicoAsignado != null
                    ? ticket.TecnicoAsignado.NombreCompleto
                    : null,
                FechaCreacion = ticket.FechaCreacion,
                FechaPrimeraRespuesta = ticket.FechaPrimeraRespuesta,
                FechaResolucion = ticket.FechaResolucion,
                FechaCierre = ticket.FechaCierre
            };
        }
    }
}