using System.ComponentModel.DataAnnotations;

namespace SistemaIncidentes.Api.DTOs
{
    public class EscalarTicketDto
    {
        [Required]
        [MaxLength(1000)]
        public string MotivoEscalamiento { get; set; } = string.Empty;
    }
}