namespace SistemaIncidentes.Api.Settings
{
    public class SlaSettings
    {
        public bool Habilitado { get; set; } = true;

        public int IntervaloRevisionMinutos { get; set; } = 30;

        public int PorcentajeProximoVencimiento { get; set; } = 25;
    }
}