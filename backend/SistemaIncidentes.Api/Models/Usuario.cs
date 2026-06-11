using System.ComponentModel.DataAnnotations;

namespace SistemaIncidentes.Api.Models
{
    public class Usuario
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string NombreCompleto { get; set; } = string.Empty;

        [Required]
        [MaxLength(120)]
        [EmailAddress]
        public string Correo { get; set; } = string.Empty;

        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        [MaxLength(20)]
        public string? Telefono { get; set; }

        public bool Activo { get; set; } = true;

        public bool EmailConfirmado { get; set; } = true;

        [MaxLength(200)]
        public string? TokenConfirmacionEmail { get; set; }

        public DateTime? FechaExpiracionTokenConfirmacion { get; set; }

        public DateTime? FechaConfirmacionEmail { get; set; }

        [MaxLength(200)]
        public string? TokenResetPassword { get; set; }

        public DateTime? FechaExpiracionTokenResetPassword { get; set; }

        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

        public DateTime? FechaActualizacion { get; set; }

        public int RolId { get; set; }

        public Rol? Rol { get; set; }
    }
}