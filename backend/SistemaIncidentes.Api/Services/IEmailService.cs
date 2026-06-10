namespace SistemaIncidentes.Api.Services
{
    public interface IEmailService
    {
        Task EnviarCorreoAsync(string destinatario, string asunto, string contenidoHtml);
    }
}