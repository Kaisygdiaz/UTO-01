namespace SistemaIncidentes.Api.DTOs
{
    public class TecnicoResponseDto
    {
        public int Id { get; set; }

        public string NombreCompleto { get; set; } = string.Empty;

        public string Correo { get; set; } = string.Empty;
    }
}