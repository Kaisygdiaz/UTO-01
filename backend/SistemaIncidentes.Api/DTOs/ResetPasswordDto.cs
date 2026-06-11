using System.ComponentModel.DataAnnotations;

namespace SistemaIncidentes.Api.DTOs
{
    public class ResetPasswordDto
    {
        [Required]
        [MinLength(8)]
        public string NuevaPassword { get; set; } = string.Empty;
    }
}