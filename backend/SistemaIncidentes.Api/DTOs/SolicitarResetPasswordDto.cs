using System.ComponentModel.DataAnnotations;

namespace SistemaIncidentes.Api.DTOs
{
    public class SolicitarResetPasswordDto
    {
        [Required]
        [EmailAddress]
        [MaxLength(120)]
        public string Correo { get; set; } = string.Empty;
    }
}