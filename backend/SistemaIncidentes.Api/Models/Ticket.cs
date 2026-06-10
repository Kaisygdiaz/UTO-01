using System.ComponentModel.DataAnnotations;

namespace SistemaIncidentes.Api.Models
{
    public class Ticket
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(150)]
        public string Titulo { get; set; } = string.Empty;

        [Required]
        [MaxLength(1000)]
        public string Descripcion { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string? Solucion { get; set; }

        [MaxLength(1000)]
        public string? ComentarioCierre { get; set; }

        public int? CalificacionSatisfaccion { get; set; }

        [MaxLength(1000)]
        public string? MotivoEscalamiento { get; set; }

        public DateTime? FechaEscalamiento { get; set; }

        [MaxLength(1000)]
        public string? MotivoCancelacion { get; set; }

        public DateTime? FechaCancelacion { get; set; }

        [MaxLength(1000)]
        public string? MotivoReapertura { get; set; }

        public DateTime? FechaReapertura { get; set; }

        [Required]
        [MaxLength(20)]
        public string Impacto { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string Urgencia { get; set; } = string.Empty;

        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

        public DateTime? FechaPrimeraRespuesta { get; set; }

        public DateTime? FechaResolucion { get; set; }

        public DateTime? FechaCierre { get; set; }

        public int UsuarioSolicitanteId { get; set; }

        public Usuario? UsuarioSolicitante { get; set; }

        public int? TecnicoAsignadoId { get; set; }

        public Usuario? TecnicoAsignado { get; set; }

        public int CategoriaId { get; set; }

        public Categoria? Categoria { get; set; }

        public int EstadoTicketId { get; set; }

        public EstadoTicket? EstadoTicket { get; set; }

        public int PrioridadId { get; set; }

        public Prioridad? Prioridad { get; set; }
    }
}