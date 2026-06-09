using System.ComponentModel.DataAnnotations;

namespace SistemaIncidentes.Api.DTOs
{
    public class CancelarTicketDto
    {
        [Required]
        [MaxLength(1000)]
        public string MotivoCancelacion { get; set; } = string.Empty;
    }
}