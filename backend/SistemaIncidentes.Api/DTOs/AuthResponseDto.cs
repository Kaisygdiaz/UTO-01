namespace SistemaIncidentes.Api.DTOs
{
    public class AuthResponseDto
    {
        public string Token { get; set; } = string.Empty;

        public DateTime ExpiraEn { get; set; }

        public UsuarioAuthDto Usuario { get; set; } = new();
    }

    public class UsuarioAuthDto
    {
        public int Id { get; set; }

        public string NombreCompleto { get; set; } = string.Empty;

        public string Correo { get; set; } = string.Empty;

        public string Rol { get; set; } = string.Empty;
    }
}