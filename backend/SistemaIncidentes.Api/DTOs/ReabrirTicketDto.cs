using System.ComponentModel.DataAnnotations;

namespace SistemaIncidentes.Api.DTOs
{
    public class ReabrirTicketDto
    {
        [Required]
        [MaxLength(1000)]
        public string MotivoReapertura { get; set; } = string.Empty;
    }
}