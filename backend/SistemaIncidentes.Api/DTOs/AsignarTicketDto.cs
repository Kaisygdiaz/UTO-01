using System.ComponentModel.DataAnnotations;

namespace SistemaIncidentes.Api.DTOs
{
    public class AsignarTicketDto
    {
        [Required]
        public int TecnicoId { get; set; }
    }
}