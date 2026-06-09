namespace SistemaIncidentes.Api.DTOs
{
    public class TicketResponseDto
    {
        public int Id { get; set; }

        public string Titulo { get; set; } = string.Empty;

        public string Descripcion { get; set; } = string.Empty;

        public string? Solucion { get; set; }

        public string? ComentarioCierre { get; set; }

        public int? CalificacionSatisfaccion { get; set; }

        public string? MotivoEscalamiento { get; set; }

        public DateTime? FechaEscalamiento { get; set; }

        public string Impacto { get; set; } = string.Empty;

        public string Urgencia { get; set; } = string.Empty;

        public string Categoria { get; set; } = string.Empty;

        public string Estado { get; set; } = string.Empty;

        public string Prioridad { get; set; } = string.Empty;

        public string UsuarioSolicitante { get; set; } = string.Empty;

        public string? TecnicoAsignado { get; set; }

        public DateTime FechaCreacion { get; set; }

        public DateTime? FechaPrimeraRespuesta { get; set; }

        public DateTime? FechaResolucion { get; set; }

        public DateTime? FechaCierre { get; set; }
    }
}