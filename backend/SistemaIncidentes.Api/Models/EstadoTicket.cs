using System.ComponentModel.DataAnnotations;

namespace SistemaIncidentes.Api.Models
{
    public class EstadoTicket
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string Nombre { get; set; } = string.Empty;

        [MaxLength(200)]
        public string? Descripcion { get; set; }

        public bool Activo { get; set; } = true;

        public ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();
    }
}