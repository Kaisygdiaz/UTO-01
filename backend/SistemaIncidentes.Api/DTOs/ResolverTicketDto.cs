using System.ComponentModel.DataAnnotations;

namespace SistemaIncidentes.Api.DTOs
{
    public class ResolverTicketDto
    {
        [Required]
        [MaxLength(1000)]
        public string Solucion { get; set; } = string.Empty;
    }
}