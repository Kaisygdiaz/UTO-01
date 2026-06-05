using System.ComponentModel.DataAnnotations;

namespace SistemaIncidentes.Api.DTOs
{
    public class CerrarTicketDto
    {
        [MaxLength(1000)]
        public string? ComentarioCierre { get; set; }

        [Range(1, 5)]
        public int? CalificacionSatisfaccion { get; set; }
    }
}