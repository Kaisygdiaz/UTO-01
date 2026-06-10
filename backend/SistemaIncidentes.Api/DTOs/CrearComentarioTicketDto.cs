using System.ComponentModel.DataAnnotations;

namespace SistemaIncidentes.Api.DTOs
{
    public class CrearComentarioTicketDto
    {
        [Required]
        [MaxLength(1000)]
        public string Comentario { get; set; } = string.Empty;

        public bool EsInterno { get; set; } = false;
    }
}