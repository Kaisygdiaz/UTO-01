using System.ComponentModel.DataAnnotations;

namespace SistemaIncidentes.Api.DTOs
{
    public class CrearTicketDto
    {
        [Required]
        [MaxLength(150)]
        public string Titulo { get; set; } = string.Empty;

        [Required]
        [MaxLength(1000)]
        public string Descripcion { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string Impacto { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string Urgencia { get; set; } = string.Empty;

        [Required]
        public int CategoriaId { get; set; }
    }
}