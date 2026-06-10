namespace SistemaIncidentes.Api.DTOs
{
    public class CatalogoResponseDto
    {
        public int Id { get; set; }

        public string Nombre { get; set; } = string.Empty;

        public string? Descripcion { get; set; }
    }
}