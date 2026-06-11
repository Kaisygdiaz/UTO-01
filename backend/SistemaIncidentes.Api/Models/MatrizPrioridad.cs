using System.ComponentModel.DataAnnotations;

namespace SistemaIncidentes.Api.Models
{
    public class MatrizPrioridad
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(20)]
        public string Impacto { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string Urgencia { get; set; } = string.Empty;

        public int PrioridadId { get; set; }

        public Prioridad? Prioridad { get; set; }

        public bool Activo { get; set; } = true;

        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

        public DateTime? FechaActualizacion { get; set; }
    }
}