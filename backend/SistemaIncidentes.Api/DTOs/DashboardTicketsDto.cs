namespace SistemaIncidentes.Api.DTOs
{
    public class DashboardTicketsDto
    {
        public int TotalTickets { get; set; }

        public int TicketsAbiertos { get; set; }

        public int TicketsEnProceso { get; set; }

        public int TicketsEscalados { get; set; }

        public int TicketsResueltos { get; set; }

        public int TicketsCerrados { get; set; }

        public int TicketsCancelados { get; set; }

        public int TicketsEvaluadosSla { get; set; }

        public int TicketsExcluidosSla { get; set; }

        public int TicketsVencidosRespuesta { get; set; }

        public int TicketsVencidosResolucion { get; set; }

        public int TicketsDentroSla { get; set; }

        public int TicketsFueraSla { get; set; }

        public decimal PorcentajeCumplimientoSla { get; set; }

        public decimal PorcentajeIncumplimientoSla { get; set; }

        public DateTime FechaGeneracion { get; set; }

        public List<ConteoPorEstadoDto> PorEstado { get; set; } = new();

        public List<ConteoPorPrioridadDto> PorPrioridad { get; set; } = new();

        public List<ConteoPorCategoriaDto> PorCategoria { get; set; } = new();

        public List<ConteoPorTecnicoDto> PorTecnico { get; set; } = new();

        public List<DetalleSlaTicketDto> TicketsVencidosDetalle { get; set; } = new();

        public List<DetalleSlaTicketDto> TicketsProximosAVencerDetalle { get; set; } = new();
    }

    public class ConteoPorEstadoDto
    {
        public string Estado { get; set; } = string.Empty;

        public int Total { get; set; }
    }

    public class ConteoPorPrioridadDto
    {
        public string Prioridad { get; set; } = string.Empty;

        public int Total { get; set; }
    }

    public class ConteoPorCategoriaDto
    {
        public string Categoria { get; set; } = string.Empty;

        public int Total { get; set; }
    }

    public class ConteoPorTecnicoDto
    {
        public string Tecnico { get; set; } = string.Empty;

        public int Total { get; set; }
    }

    public class DetalleSlaTicketDto
    {
        public int Id { get; set; }

        public string Titulo { get; set; } = string.Empty;

        public string Estado { get; set; } = string.Empty;

        public string Prioridad { get; set; } = string.Empty;

        public string? TecnicoAsignado { get; set; }

        public DateTime FechaCreacion { get; set; }

        public DateTime FechaLimiteRespuesta { get; set; }

        public DateTime FechaLimiteResolucion { get; set; }

        public decimal HorasRestantesResolucion { get; set; }

        public decimal HorasVencidasResolucion { get; set; }

        public string TipoAlerta { get; set; } = string.Empty;
    }
}