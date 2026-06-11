using System.ComponentModel.DataAnnotations;

namespace SistemaIncidentes.Api.Models
{
    public class Prioridad
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string Nombre { get; set; } = string.Empty;

        [MaxLength(200)]
        public string? Descripcion { get; set; }

        public int TiempoRespuestaHoras { get; set; }

        public int TiempoResolucionHoras { get; set; }

        public bool Activo { get; set; } = true;

        public DateTime? FechaActualizacion { get; set; }

        public ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();
    }
}