namespace SistemaIncidentes.Api.DTOs
{
    public class UsuarioResponseDto
    {
        public int Id { get; set; }

        public string NombreCompleto { get; set; } = string.Empty;

        public string Correo { get; set; } = string.Empty;

        public string? Telefono { get; set; }

        public string Rol { get; set; } = string.Empty;

        public bool Activo { get; set; }

        public bool EmailConfirmado { get; set; }

        public DateTime FechaCreacion { get; set; }
    }
}