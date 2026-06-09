using System.ComponentModel.DataAnnotations;

namespace SistemaIncidentes.Api.Models
{
    public class BitacoraAuditoria
    {
        public int Id { get; set; }

        public int TicketId { get; set; }

        public Ticket? Ticket { get; set; }

        public int UsuarioId { get; set; }

        public Usuario? Usuario { get; set; }

        [Required]
        [MaxLength(100)]
        public string Accion { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string? Detalle { get; set; }

        public DateTime FechaRegistro { get; set; } = DateTime.UtcNow;
    }
}