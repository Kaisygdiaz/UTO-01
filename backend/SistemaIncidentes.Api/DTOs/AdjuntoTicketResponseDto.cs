namespace SistemaIncidentes.Api.DTOs
{
    public class AdjuntoTicketResponseDto
    {
        public int Id { get; set; }

        public int TicketId { get; set; }

        public string NombreArchivoOriginal { get; set; } = string.Empty;

        public string TipoContenido { get; set; } = string.Empty;

        public long TamanoBytes { get; set; }

        public string? Descripcion { get; set; }

        public string Usuario { get; set; } = string.Empty;

        public DateTime FechaCarga { get; set; }
    }
}