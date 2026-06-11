using System.ComponentModel.DataAnnotations;

namespace SistemaIncidentes.Api.Models
{
    public class NotificacionSla
    {
        public int Id { get; set; }

        public int TicketId { get; set; }

        public Ticket Ticket { get; set; } = null!;

        [Required]
        [MaxLength(80)]
        public string TipoAlerta { get; set; } = string.Empty;

        [Required]
        [MaxLength(120)]
        public string DestinatarioCorreo { get; set; } = string.Empty;

        [Required]
        [MaxLength(150)]
        public string DestinatarioNombre { get; set; } = string.Empty;

        public DateTime FechaEnvio { get; set; } = DateTime.UtcNow;
    }
}