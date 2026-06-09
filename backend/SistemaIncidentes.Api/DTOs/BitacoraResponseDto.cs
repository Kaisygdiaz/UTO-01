namespace SistemaIncidentes.Api.DTOs
{
    public class BitacoraResponseDto
    {
        public int Id { get; set; }

        public int TicketId { get; set; }

        public string Usuario { get; set; } = string.Empty;

        public string Accion { get; set; } = string.Empty;

        public string? Detalle { get; set; }

        public DateTime FechaRegistro { get; set; }
    }
}