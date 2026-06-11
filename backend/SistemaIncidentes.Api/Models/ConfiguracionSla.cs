using System.ComponentModel.DataAnnotations;

namespace SistemaIncidentes.Api.Models
{
    public class ConfiguracionSla
    {
        public int Id { get; set; }

        public bool Habilitado { get; set; } = true;

        public int IntervaloRevisionMinutos { get; set; } = 1;

        public int PorcentajeProximoVencimiento { get; set; } = 25;

        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

        public DateTime? FechaActualizacion { get; set; }

        public int? UsuarioActualizacionId { get; set; }

        public Usuario? UsuarioActualizacion { get; set; }
    }
}