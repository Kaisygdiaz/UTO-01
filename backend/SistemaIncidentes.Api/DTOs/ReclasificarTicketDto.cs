using System.ComponentModel.DataAnnotations;

namespace SistemaIncidentes.Api.DTOs
{
    public class ReclasificarTicketDto
    {
        [Required]
        [MaxLength(20)]
        public string Impacto { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string Urgencia { get; set; } = string.Empty;

        [Required]
        [MaxLength(1000)]
        public string MotivoReclasificacion { get; set; } = string.Empty;
    }
}