using System.ComponentModel.DataAnnotations;

namespace SistemaIncidentes.Api.DTOs
{
    public class ActivarCuentaDto
    {
        [Required(ErrorMessage = "El token es obligatorio.")]
        public string Token { get; set; } = string.Empty;

        [Required(ErrorMessage = "La nueva contraseña es obligatoria.")]
        [MinLength(6, ErrorMessage = "La nueva contraseña debe tener al menos 6 caracteres.")]
        public string NuevaPassword { get; set; } = string.Empty;
    }
}