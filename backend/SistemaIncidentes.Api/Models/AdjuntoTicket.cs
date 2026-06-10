using System.ComponentModel.DataAnnotations;

namespace SistemaIncidentes.Api.Models
{
    public class AdjuntoTicket
    {
        public int Id { get; set; }

        public int TicketId { get; set; }

        public Ticket Ticket { get; set; } = null!;

        public int UsuarioId { get; set; }

        public Usuario Usuario { get; set; } = null!;

        [Required]
        [MaxLength(255)]
        public string NombreArchivoOriginal { get; set; } = string.Empty;

        [Required]
        [MaxLength(255)]
        public string NombreArchivoGuardado { get; set; } = string.Empty;

        [Required]
        [MaxLength(500)]
        public string RutaArchivo { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string TipoContenido { get; set; } = string.Empty;

        public long TamanoBytes { get; set; }

        [MaxLength(500)]
        public string? Descripcion { get; set; }

        public DateTime FechaCarga { get; set; } = DateTime.UtcNow;

        public bool Activo { get; set; } = true;
    }
}