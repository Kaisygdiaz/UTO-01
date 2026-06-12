using SistemaIncidentes.Api.DTOs;
using SistemaIncidentes.Api.Models;

namespace SistemaIncidentes.Api.Helpers.Tickets
{
    public static class TicketResponseMapper
    {
        private const int HorasAlertaProximoVencimiento = 4;

        public static TicketResponseDto ToResponseDto(Ticket ticket)
        {
            var estado = ticket.EstadoTicket != null ? ticket.EstadoTicket.Nombre : string.Empty;
            var prioridad = ticket.Prioridad != null ? ticket.Prioridad.Nombre : string.Empty;

            var fechaLimiteSla = CalcularFechaLimiteSla(ticket);
            var estaFueraSla = CalcularEstaFueraSla(ticket, estado, fechaLimiteSla);
            var estaProximoAVencerSla = CalcularEstaProximoAVencerSla(
                estado,
                fechaLimiteSla,
                estaFueraSla
            );

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
                Estado = estado,
                Prioridad = prioridad,
                UsuarioSolicitante = ticket.UsuarioSolicitante != null
                    ? ticket.UsuarioSolicitante.NombreCompleto
                    : string.Empty,
                TecnicoAsignado = ticket.TecnicoAsignado != null
                    ? ticket.TecnicoAsignado.NombreCompleto
                    : null,
                FechaCreacion = ticket.FechaCreacion,
                FechaPrimeraRespuesta = ticket.FechaPrimeraRespuesta,
                FechaResolucion = ticket.FechaResolucion,
                FechaCierre = ticket.FechaCierre,

                TiempoRespuestaHoras = ticket.Prioridad?.TiempoRespuestaHoras,
                TiempoResolucionHoras = ticket.Prioridad?.TiempoResolucionHoras,
                FechaLimiteSla = fechaLimiteSla,
                EstaFueraSla = estaFueraSla,
                EstaProximoAVencerSla = estaProximoAVencerSla
            };
        }

        private static DateTime? CalcularFechaLimiteSla(Ticket ticket)
        {
            if (ticket.Prioridad == null || ticket.Prioridad.TiempoResolucionHoras <= 0)
            {
                return null;
            }

            return NormalizarFechaUtc(ticket.FechaCreacion)
                .AddHours(ticket.Prioridad.TiempoResolucionHoras);
        }

        private static bool CalcularEstaFueraSla(
            Ticket ticket,
            string estado,
            DateTime? fechaLimiteSla)
        {
            if (!fechaLimiteSla.HasValue || EsEstadoCancelado(estado))
            {
                return false;
            }

            var fechaComparacion = ObtenerFechaComparacionSla(ticket, estado);

            return fechaComparacion > fechaLimiteSla.Value;
        }

        private static bool CalcularEstaProximoAVencerSla(
            string estado,
            DateTime? fechaLimiteSla,
            bool estaFueraSla)
        {
            if (!fechaLimiteSla.HasValue || estaFueraSla)
            {
                return false;
            }

            if (EsEstadoFinalizado(estado) || EsEstadoCancelado(estado))
            {
                return false;
            }

            var ahora = DateTime.UtcNow;
            var tiempoRestante = fechaLimiteSla.Value - ahora;

            return tiempoRestante > TimeSpan.Zero &&
                   tiempoRestante <= TimeSpan.FromHours(HorasAlertaProximoVencimiento);
        }

        private static DateTime ObtenerFechaComparacionSla(Ticket ticket, string estado)
        {
            if (EsEstadoFinalizado(estado))
            {
                var fechaFinalizacion = ticket.FechaResolucion
                    ?? ticket.FechaCierre
                    ?? DateTime.UtcNow;

                return NormalizarFechaUtc(fechaFinalizacion);
            }

            return DateTime.UtcNow;
        }

        private static bool EsEstadoFinalizado(string estado)
        {
            return estado.Equals("Resuelto", StringComparison.OrdinalIgnoreCase)
                || estado.Equals("Cerrado", StringComparison.OrdinalIgnoreCase);
        }

        private static bool EsEstadoCancelado(string estado)
        {
            return estado.Equals("Cancelado", StringComparison.OrdinalIgnoreCase);
        }

        private static DateTime NormalizarFechaUtc(DateTime fecha)
        {
            if (fecha.Kind == DateTimeKind.Utc)
            {
                return fecha;
            }

            return DateTime.SpecifyKind(fecha, DateTimeKind.Utc);
        }
    }
}