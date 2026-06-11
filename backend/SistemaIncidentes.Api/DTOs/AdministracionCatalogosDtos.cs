using System.ComponentModel.DataAnnotations;

namespace SistemaIncidentes.Api.DTOs
{
    public class CrearActualizarCategoriaDto
    {
        [Required]
        [MaxLength(80)]
        public string Nombre { get; set; } = string.Empty;

        [MaxLength(250)]
        public string? Descripcion { get; set; }
    }

    public class CrearActualizarPrioridadDto
    {
        [Required]
        [MaxLength(50)]
        public string Nombre { get; set; } = string.Empty;

        [MaxLength(200)]
        public string? Descripcion { get; set; }

        [Range(1, 10000)]
        public int TiempoRespuestaHoras { get; set; }

        [Range(1, 10000)]
        public int TiempoResolucionHoras { get; set; }
    }

    public class CambiarEstadoCatalogoDto
    {
        public bool Activo { get; set; }
    }

    public class ActualizarMatrizPrioridadDto
    {
        [Required]
        public int PrioridadId { get; set; }
    }

    public class ActualizarConfiguracionSlaDto
    {
        public bool Habilitado { get; set; }

        [Range(1, 1440)]
        public int IntervaloRevisionMinutos { get; set; }

        [Range(1, 100)]
        public int PorcentajeProximoVencimiento { get; set; }
    }

    public class CategoriaAdministracionResponseDto
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string? Descripcion { get; set; }
        public bool Activo { get; set; }
        public DateTime FechaCreacion { get; set; }
        public DateTime? FechaActualizacion { get; set; }
    }

    public class PrioridadAdministracionResponseDto
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string? Descripcion { get; set; }
        public int TiempoRespuestaHoras { get; set; }
        public int TiempoResolucionHoras { get; set; }
        public bool Activo { get; set; }
        public DateTime? FechaActualizacion { get; set; }
    }

    public class MatrizPrioridadResponseDto
    {
        public int Id { get; set; }
        public string Impacto { get; set; } = string.Empty;
        public string Urgencia { get; set; } = string.Empty;
        public int PrioridadId { get; set; }
        public string Prioridad { get; set; } = string.Empty;
        public bool Activo { get; set; }
        public DateTime FechaCreacion { get; set; }
        public DateTime? FechaActualizacion { get; set; }
    }

    public class ConfiguracionSlaResponseDto
    {
        public int Id { get; set; }
        public bool Habilitado { get; set; }
        public int IntervaloRevisionMinutos { get; set; }
        public int PorcentajeProximoVencimiento { get; set; }
        public DateTime FechaCreacion { get; set; }
        public DateTime? FechaActualizacion { get; set; }
        public string? ActualizadoPor { get; set; }
    }
}