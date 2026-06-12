using SistemaIncidentes.Api.Models;

namespace SistemaIncidentes.Api.Helpers.Tickets
{
    public static class TicketEmailTemplateBuilder
    {
        public static string CrearCorreoTicketCreado(string nombreSolicitante, Ticket ticket, string categoria, string prioridad)
        {
            return CrearPlantillaCorreo(
                "Ticket registrado correctamente",
                nombreSolicitante,
                $@"
                    <p>Su ticket fue registrado correctamente en la mesa de ayuda.</p>
                    <p><strong>Número de ticket:</strong> #{ticket.Id}</p>
                    <p><strong>Título:</strong> {EscaparHtml(ticket.Titulo)}</p>
                    <p><strong>Categoría:</strong> {EscaparHtml(categoria)}</p>
                    <p><strong>Prioridad:</strong> {EscaparHtml(prioridad)}</p>
                    <p><strong>Estado actual:</strong> Abierto</p>
                ");
        }

        public static string CrearCorreoTicketAsignado(string nombreTecnico, Ticket ticket)
        {
            return CrearPlantillaCorreo(
                "Nuevo ticket asignado",
                nombreTecnico,
                $@"
                    <p>Se le ha asignado un ticket para atención técnica.</p>
                    <p><strong>Número de ticket:</strong> #{ticket.Id}</p>
                    <p><strong>Título:</strong> {EscaparHtml(ticket.Titulo)}</p>
                    <p><strong>Solicitante:</strong> {EscaparHtml(ticket.UsuarioSolicitante?.NombreCompleto ?? "Sin solicitante")}</p>
                    <p><strong>Categoría:</strong> {EscaparHtml(ticket.Categoria?.Nombre ?? "Sin categoría")}</p>
                    <p><strong>Prioridad:</strong> {EscaparHtml(ticket.Prioridad?.Nombre ?? "Sin prioridad")}</p>
                    <p><strong>Estado actual:</strong> En proceso</p>
                ");
        }

        public static string CrearCorreoTicketResuelto(string nombreSolicitante, Ticket ticket)
        {
            return CrearPlantillaCorreo(
                "Ticket resuelto",
                nombreSolicitante,
                $@"
                    <p>Su ticket fue marcado como resuelto por el equipo de soporte.</p>
                    <p><strong>Número de ticket:</strong> #{ticket.Id}</p>
                    <p><strong>Título:</strong> {EscaparHtml(ticket.Titulo)}</p>
                    <p><strong>Solución registrada:</strong></p>
                    <p>{EscaparHtml(ticket.Solucion ?? "Solución no especificada.")}</p>
                    <p>Si la solución es correcta, el ticket podrá cerrarse formalmente.</p>
                ");
        }

        public static string CrearCorreoCambioEstado(string nombreDestinatario, Ticket ticket, string estado, string? detalle)
        {
            return CrearPlantillaCorreo(
                $"Ticket {estado.ToLower()}",
                nombreDestinatario,
                $@"
                    <p>El estado de su ticket fue actualizado.</p>
                    <p><strong>Número de ticket:</strong> #{ticket.Id}</p>
                    <p><strong>Título:</strong> {EscaparHtml(ticket.Titulo)}</p>
                    <p><strong>Nuevo estado:</strong> {EscaparHtml(estado)}</p>
                    {(string.IsNullOrWhiteSpace(detalle) ? string.Empty : $"<p><strong>Detalle:</strong> {EscaparHtml(detalle)}</p>")}
                ");
        }

        public static string CrearCorreoTicketReclasificado(
            string nombreSolicitante,
            Ticket ticket,
            string impactoAnterior,
            string urgenciaAnterior,
            string prioridadAnterior,
            string nuevaPrioridad,
            string motivo)
        {
            return CrearPlantillaCorreo(
                "Ticket reclasificado",
                nombreSolicitante,
                $@"
                    <p>La clasificación de su ticket fue revisada por el equipo de soporte.</p>
                    <p><strong>Número de ticket:</strong> #{ticket.Id}</p>
                    <p><strong>Título:</strong> {EscaparHtml(ticket.Titulo)}</p>
                    <p><strong>Impacto anterior:</strong> {EscaparHtml(impactoAnterior)}</p>
                    <p><strong>Urgencia anterior:</strong> {EscaparHtml(urgenciaAnterior)}</p>
                    <p><strong>Prioridad anterior:</strong> {EscaparHtml(prioridadAnterior)}</p>
                    <p><strong>Nuevo impacto:</strong> {EscaparHtml(ticket.Impacto)}</p>
                    <p><strong>Nueva urgencia:</strong> {EscaparHtml(ticket.Urgencia)}</p>
                    <p><strong>Nueva prioridad:</strong> {EscaparHtml(nuevaPrioridad)}</p>
                    <p><strong>Motivo de reclasificación:</strong> {EscaparHtml(motivo)}</p>
                ");
        }

        public static string CrearCorreoComentario(
            string nombreDestinatario,
            Ticket ticket,
            ComentarioTicket comentario,
            string nombreAutor,
            string rolAutor)
        {
            string tipoComentario = comentario.EsInterno ? "interno" : "público";

            return CrearPlantillaCorreo(
                $"Nuevo comentario {tipoComentario}",
                nombreDestinatario,
                $@"
                    <p>Se agregó un comentario {EscaparHtml(tipoComentario)} al ticket.</p>
                    <p><strong>Número de ticket:</strong> #{ticket.Id}</p>
                    <p><strong>Título:</strong> {EscaparHtml(ticket.Titulo)}</p>
                    <p><strong>Autor:</strong> {EscaparHtml(nombreAutor)} ({EscaparHtml(rolAutor)})</p>
                    <p><strong>Comentario:</strong></p>
                    <p>{EscaparHtml(comentario.Comentario)}</p>
                ");
        }

        private static string CrearPlantillaCorreo(string titulo, string nombreDestinatario, string contenido)
        {
            return $@"
                <div style=""font-family: Arial, sans-serif; color: #222; line-height: 1.5;"">
                    <h2 style=""color: #1f4e79;"">{EscaparHtml(titulo)}</h2>
                    <p>Hola {EscaparHtml(nombreDestinatario)},</p>
                    {contenido}
                    <hr />
                    <p style=""font-size: 12px; color: #666;"">
                        Este mensaje fue enviado automáticamente por el Sistema de Gestión de Incidentes Tecnológicos UTO.
                    </p>
                </div>";
        }

        private static string EscaparHtml(string valor)
        {
            return System.Net.WebUtility.HtmlEncode(valor);
        }
    }
}