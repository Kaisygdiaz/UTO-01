using System.ComponentModel.DataAnnotations;

namespace SistemaIncidentes.Api.Models
{
    public class Categoria
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(80)]
        public string Nombre { get; set; } = string.Empty;

        [MaxLength(250)]
        public string? Descripcion { get; set; }

        public bool Activo { get; set; } = true;

        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

        public ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();
    }
}