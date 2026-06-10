namespace SistemaIncidentes.Api.DTOs
{
    public class ComentarioTicketResponseDto
    {
        public int Id { get; set; }

        public int TicketId { get; set; }

        public string Usuario { get; set; } = string.Empty;

        public string Rol { get; set; } = string.Empty;

        public string Comentario { get; set; } = string.Empty;

        public bool EsInterno { get; set; }

        public string TipoComentario { get; set; } = string.Empty;

        public DateTime FechaRegistro { get; set; }
    }
}