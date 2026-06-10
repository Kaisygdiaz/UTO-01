using System.ComponentModel.DataAnnotations;

namespace SistemaIncidentes.Api.Models
{
    public class ComentarioTicket
    {
        public int Id { get; set; }

        public int TicketId { get; set; }

        public Ticket? Ticket { get; set; }

        public int UsuarioId { get; set; }

        public Usuario? Usuario { get; set; }

        [Required]
        [MaxLength(1000)]
        public string Comentario { get; set; } = string.Empty;

        public bool EsInterno { get; set; } = false;

        public DateTime FechaRegistro { get; set; } = DateTime.UtcNow;
    }
}