using System.ComponentModel.DataAnnotations;

namespace SistemaIncidentes.Api.DTOs
{
    public class CrearUsuarioDto
    {
        [Required(ErrorMessage = "El nombre completo es obligatorio.")]
        public string NombreCompleto { get; set; } = string.Empty;

        [Required(ErrorMessage = "El correo es obligatorio.")]
        [EmailAddress(ErrorMessage = "El correo no tiene un formato válido.")]
        public string Correo { get; set; } = string.Empty;

        public string? Telefono { get; set; }

        [Required(ErrorMessage = "El rol es obligatorio.")]
        [Range(1, int.MaxValue, ErrorMessage = "Debe seleccionar un rol válido.")]
        public int RolId { get; set; }
    }
}