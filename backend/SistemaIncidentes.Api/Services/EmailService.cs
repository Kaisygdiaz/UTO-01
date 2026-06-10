using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Options;
using SistemaIncidentes.Api.Settings;

namespace SistemaIncidentes.Api.Services
{
    public class EmailService : IEmailService
    {
        private readonly EmailSettings _settings;

        public EmailService(IOptions<EmailSettings> options)
        {
            _settings = options.Value;
        }

        public async Task EnviarCorreoAsync(string destinatario, string asunto, string contenidoHtml)
        {
            if (string.IsNullOrWhiteSpace(_settings.SmtpServer) ||
                string.IsNullOrWhiteSpace(_settings.SenderEmail) ||
                string.IsNullOrWhiteSpace(_settings.Username) ||
                string.IsNullOrWhiteSpace(_settings.Password))
            {
                throw new InvalidOperationException("La configuración SMTP no está completa.");
            }

            using var mensaje = new MailMessage
            {
                From = new MailAddress(_settings.SenderEmail, _settings.SenderName),
                Subject = asunto,
                Body = contenidoHtml,
                IsBodyHtml = true
            };

            mensaje.To.Add(destinatario);

            using var cliente = new SmtpClient(_settings.SmtpServer, _settings.SmtpPort)
            {
                EnableSsl = _settings.EnableSsl,
                Credentials = new NetworkCredential(_settings.Username, _settings.Password)
            };

            await cliente.SendMailAsync(mensaje);
        }
    }
}