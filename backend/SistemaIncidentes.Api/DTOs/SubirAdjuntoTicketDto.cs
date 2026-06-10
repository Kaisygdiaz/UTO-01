using System.ComponentModel.DataAnnotations;

namespace SistemaIncidentes.Api.DTOs
{
    public class SubirAdjuntoTicketDto
    {
        [Required]
        public IFormFile Archivo { get; set; } = null!;

        [MaxLength(500)]
        public string? Descripcion { get; set; }
    }
}