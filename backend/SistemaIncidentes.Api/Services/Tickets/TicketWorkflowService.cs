using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SistemaIncidentes.Api.Data;
using SistemaIncidentes.Api.DTOs;
using SistemaIncidentes.Api.Helpers.Tickets;
using SistemaIncidentes.Api.Models;

namespace SistemaIncidentes.Api.Services
{
    public class TicketWorkflowService : ITicketWorkflowService
    {
        private readonly ApplicationDbContext _context;
        private readonly IEmailService _emailService;
        private readonly ILogger<TicketWorkflowService> _logger;

        public TicketWorkflowService(
            ApplicationDbContext context,
            IEmailService emailService,
            ILogger<TicketWorkflowService> logger)
        {
            _context = context;
            _emailService = emailService;
            _logger = logger;
        }

        public async Task<TicketWorkflowResultado> AsignarTicketAsync(int id, AsignarTicketDto dto, ClaimsPrincipal user, bool modelStateIsValid, object? erroresValidacion)
        {
            var datosUsuario = ObtenerDatosUsuario(user);

            if (datosUsuario == null)
            {
                return TicketWorkflowResultado.Unauthorized(new { mensaje = "No se pudo identificar al usuario autenticado." });
            }

            if (datosUsuario.Value.RolUsuario != "Administrador" && datosUsuario.Value.RolUsuario != "Jefe DTI")
            {
                return TicketWorkflowResultado.Forbidden();
            }

            if (!modelStateIsValid)
            {
                return TicketWorkflowResultado.BadRequest(new { mensaje = "Los datos enviados no son válidos.", errores = erroresValidacion });
            }

            var ticket = await _context.Tickets
                .Include(t => t.UsuarioSolicitante)
                .Include(t => t.Categoria)
                .Include(t => t.Prioridad)
                .Include(t => t.EstadoTicket)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (ticket == null)
            {
                return TicketWorkflowResultado.NotFound(new { mensaje = "Ticket no encontrado." });
            }

            if (ticket.EstadoTicket != null &&
                (ticket.EstadoTicket.Nombre == "Cerrado" || ticket.EstadoTicket.Nombre == "Cancelado"))
            {
                return TicketWorkflowResultado.BadRequest(new { mensaje = "No se puede asignar un ticket cerrado o cancelado." });
            }

            var tecnico = await _context.Usuarios
                .Include(u => u.Rol)
                .FirstOrDefaultAsync(u => u.Id == dto.TecnicoId && u.Activo);

            if (tecnico == null)
            {
                return TicketWorkflowResultado.BadRequest(new { mensaje = "El técnico seleccionado no existe o se encuentra inactivo." });
            }

            if (tecnico.Rol == null || tecnico.Rol.Nombre != "Técnico")
            {
                return TicketWorkflowResultado.BadRequest(new { mensaje = "El usuario seleccionado no tiene rol de Técnico." });
            }

            var estadoEnProceso = await _context.EstadosTicket
                .FirstOrDefaultAsync(e => e.Nombre == "En proceso" && e.Activo);

            if (estadoEnProceso == null)
            {
                return TicketWorkflowResultado.InternalServerError(new { mensaje = "No se encontró el estado 'En proceso'. Verifique los datos base del sistema." });
            }

            ticket.TecnicoAsignadoId = tecnico.Id;
            ticket.EstadoTicketId = estadoEnProceso.Id;

            if (ticket.FechaPrimeraRespuesta == null)
            {
                ticket.FechaPrimeraRespuesta = DateTime.UtcNow;
            }

            await RegistrarBitacoraAsync(
                ticket.Id,
                datosUsuario.Value.UsuarioId,
                "Ticket asignado",
                $"El ticket fue asignado al técnico {tecnico.NombreCompleto} y cambió al estado En proceso.");

            await _context.SaveChangesAsync();

            await EnviarCorreoSeguroAsync(
                tecnico.Correo,
                $"Ticket #{ticket.Id} asignado - {ticket.Titulo}",
                TicketEmailTemplateBuilder.CrearCorreoTicketAsignado(tecnico.NombreCompleto, ticket),
                ticket.Id,
                "Error notificación asignación");

            var ticketActualizado = await ObtenerTicketResponsePorIdAsync(ticket.Id);

            return TicketWorkflowResultado.Ok(new
            {
                mensaje = "Ticket asignado correctamente.",
                ticket = ticketActualizado
            });
        }

        public async Task<TicketWorkflowResultado> ReclasificarTicketAsync(int id, ReclasificarTicketDto dto, ClaimsPrincipal user, bool modelStateIsValid, object? erroresValidacion)
        {
            var datosUsuario = ObtenerDatosUsuario(user);

            if (datosUsuario == null)
            {
                return TicketWorkflowResultado.Unauthorized(new { mensaje = "No se pudo identificar al usuario autenticado." });
            }

            if (!modelStateIsValid)
            {
                return TicketWorkflowResultado.BadRequest(new { mensaje = "Los datos enviados no son válidos.", errores = erroresValidacion });
            }

            var ticket = await _context.Tickets
                .Include(t => t.UsuarioSolicitante)
                .Include(t => t.TecnicoAsignado)
                .Include(t => t.EstadoTicket)
                .Include(t => t.Categoria)
                .Include(t => t.Prioridad)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (ticket == null)
            {
                return TicketWorkflowResultado.NotFound(new { mensaje = "Ticket no encontrado." });
            }

            bool esTecnicoAsignado = ticket.TecnicoAsignadoId == datosUsuario.Value.UsuarioId;
            bool esAdministradorOJefe = datosUsuario.Value.RolUsuario == "Administrador" || datosUsuario.Value.RolUsuario == "Jefe DTI";

            if (!esTecnicoAsignado && !esAdministradorOJefe)
            {
                return TicketWorkflowResultado.Forbidden();
            }

            if (ticket.EstadoTicket == null)
            {
                return TicketWorkflowResultado.InternalServerError(new { mensaje = "El ticket no tiene un estado válido asociado." });
            }

            if (ticket.EstadoTicket.Nombre == "Cerrado" || ticket.EstadoTicket.Nombre == "Cancelado")
            {
                return TicketWorkflowResultado.BadRequest(new { mensaje = "No se puede reclasificar un ticket cerrado o cancelado." });
            }

            var nuevaPrioridad = await ObtenerPrioridadAsync(dto.Impacto, dto.Urgencia);

            if (nuevaPrioridad == null)
            {
                return TicketWorkflowResultado.BadRequest(new
                {
                    mensaje = "No fue posible calcular la prioridad. Verifique que el impacto y la urgencia sean válidos.",
                    valoresPermitidos = new
                    {
                        impacto = new[] { "Bajo", "Medio", "Alto" },
                        urgencia = new[] { "Baja", "Media", "Alta" }
                    }
                });
            }

            string impactoAnterior = ticket.Impacto;
            string urgenciaAnterior = ticket.Urgencia;
            string prioridadAnterior = ticket.Prioridad != null ? ticket.Prioridad.Nombre : "Sin prioridad";

            string impactoNuevo = NormalizarTexto(dto.Impacto);
            string urgenciaNueva = NormalizarTexto(dto.Urgencia);

            bool sinCambios =
                impactoAnterior == impactoNuevo &&
                urgenciaAnterior == urgenciaNueva &&
                ticket.PrioridadId == nuevaPrioridad.Id;

            if (sinCambios)
            {
                return TicketWorkflowResultado.BadRequest(new { mensaje = "La clasificación enviada es igual a la clasificación actual del ticket." });
            }

            ticket.Impacto = impactoNuevo;
            ticket.Urgencia = urgenciaNueva;
            ticket.PrioridadId = nuevaPrioridad.Id;

            await RegistrarBitacoraAsync(
                ticket.Id,
                datosUsuario.Value.UsuarioId,
                "Ticket reclasificado",
                $"El ticket fue reclasificado.\n\nImpacto anterior: {impactoAnterior}\nUrgencia anterior: {urgenciaAnterior}\nPrioridad anterior: {prioridadAnterior}\n\n" +
                $"Nuevo impacto: {ticket.Impacto}\nNueva urgencia: {ticket.Urgencia}\nNueva prioridad: {nuevaPrioridad.Nombre}\n\n" +
                $"Motivo: {dto.MotivoReclasificacion.Trim()}");

            await _context.SaveChangesAsync();

            if (ticket.UsuarioSolicitante != null)
            {
                await EnviarCorreoSeguroAsync(
                    ticket.UsuarioSolicitante.Correo,
                    $"Ticket #{ticket.Id} reclasificado - {ticket.Titulo}",
                    TicketEmailTemplateBuilder.CrearCorreoTicketReclasificado(
                        ticket.UsuarioSolicitante.NombreCompleto,
                        ticket,
                        impactoAnterior,
                        urgenciaAnterior,
                        prioridadAnterior,
                        nuevaPrioridad.Nombre,
                        dto.MotivoReclasificacion.Trim()),
                    ticket.Id,
                    "Error notificación reclasificación");
            }

            var ticketActualizado = await ObtenerTicketResponsePorIdAsync(ticket.Id);

            return TicketWorkflowResultado.Ok(new
            {
                mensaje = "Ticket reclasificado correctamente.",
                ticket = ticketActualizado
            });
        }

        public async Task<TicketWorkflowResultado> EscalarTicketAsync(int id, EscalarTicketDto dto, ClaimsPrincipal user, bool modelStateIsValid, object? erroresValidacion)
        {
            var datosUsuario = ObtenerDatosUsuario(user);

            if (datosUsuario == null)
            {
                return TicketWorkflowResultado.Unauthorized(new { mensaje = "No se pudo identificar al usuario autenticado." });
            }

            if (!modelStateIsValid)
            {
                return TicketWorkflowResultado.BadRequest(new { mensaje = "Los datos enviados no son válidos.", errores = erroresValidacion });
            }

            var ticket = await _context.Tickets
                .Include(t => t.UsuarioSolicitante)
                .Include(t => t.TecnicoAsignado)
                .Include(t => t.EstadoTicket)
                .Include(t => t.Categoria)
                .Include(t => t.Prioridad)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (ticket == null)
            {
                return TicketWorkflowResultado.NotFound(new { mensaje = "Ticket no encontrado." });
            }

            bool esTecnicoAsignado = ticket.TecnicoAsignadoId == datosUsuario.Value.UsuarioId;
            bool esAdministradorOJefe = datosUsuario.Value.RolUsuario == "Administrador" || datosUsuario.Value.RolUsuario == "Jefe DTI";

            if (!esTecnicoAsignado && !esAdministradorOJefe)
            {
                return TicketWorkflowResultado.Forbidden();
            }

            if (ticket.EstadoTicket == null)
            {
                return TicketWorkflowResultado.InternalServerError(new { mensaje = "El ticket no tiene un estado válido asociado." });
            }

            if (ticket.EstadoTicket.Nombre == "Cerrado")
            {
                return TicketWorkflowResultado.BadRequest(new { mensaje = "No se puede escalar un ticket cerrado." });
            }

            if (ticket.EstadoTicket.Nombre == "Cancelado")
            {
                return TicketWorkflowResultado.BadRequest(new { mensaje = "No se puede escalar un ticket cancelado." });
            }

            if (ticket.EstadoTicket.Nombre == "Resuelto")
            {
                return TicketWorkflowResultado.BadRequest(new { mensaje = "No se puede escalar un ticket resuelto. Si el incidente continúa, debe reabrirse o crearse un nuevo ticket." });
            }

            if (ticket.EstadoTicket.Nombre == "Escalado")
            {
                return TicketWorkflowResultado.BadRequest(new { mensaje = "El ticket ya se encuentra escalado." });
            }

            if (ticket.EstadoTicket.Nombre == "Abierto")
            {
                return TicketWorkflowResultado.BadRequest(new { mensaje = "No se puede escalar un ticket abierto. Primero debe asignarse a un técnico y pasar a estado 'En proceso'." });
            }

            if (ticket.EstadoTicket.Nombre != "En proceso")
            {
                return TicketWorkflowResultado.BadRequest(new { mensaje = $"No se puede escalar un ticket en estado '{ticket.EstadoTicket.Nombre}'." });
            }

            if (ticket.TecnicoAsignadoId == null)
            {
                return TicketWorkflowResultado.BadRequest(new { mensaje = "No se puede escalar un ticket sin técnico asignado." });
            }

            var estadoEscalado = await _context.EstadosTicket
                .FirstOrDefaultAsync(e => e.Nombre == "Escalado" && e.Activo);

            if (estadoEscalado == null)
            {
                return TicketWorkflowResultado.InternalServerError(new { mensaje = "No se encontró el estado 'Escalado'. Verifique los datos base del sistema." });
            }

            ticket.EstadoTicketId = estadoEscalado.Id;
            ticket.MotivoEscalamiento = dto.MotivoEscalamiento.Trim();
            ticket.FechaEscalamiento = DateTime.UtcNow;

            await RegistrarBitacoraAsync(
                ticket.Id,
                datosUsuario.Value.UsuarioId,
                "Ticket escalado",
                $"El ticket fue escalado.\n\nMotivo de escalamiento: {ticket.MotivoEscalamiento}");

            await _context.SaveChangesAsync();

            if (ticket.UsuarioSolicitante != null)
            {
                await EnviarCorreoSeguroAsync(
                    ticket.UsuarioSolicitante.Correo,
                    $"Ticket #{ticket.Id} escalado - {ticket.Titulo}",
                    TicketEmailTemplateBuilder.CrearCorreoCambioEstado(ticket.UsuarioSolicitante.NombreCompleto, ticket, "Escalado", ticket.MotivoEscalamiento),
                    ticket.Id,
                    "Error notificación escalamiento");
            }

            var ticketActualizado = await ObtenerTicketResponsePorIdAsync(ticket.Id);

            return TicketWorkflowResultado.Ok(new
            {
                mensaje = "Ticket escalado correctamente.",
                ticket = ticketActualizado
            });
        }

        public async Task<TicketWorkflowResultado> CancelarTicketAsync(int id, CancelarTicketDto dto, ClaimsPrincipal user, bool modelStateIsValid, object? erroresValidacion)
        {
            var datosUsuario = ObtenerDatosUsuario(user);

            if (datosUsuario == null)
            {
                return TicketWorkflowResultado.Unauthorized(new { mensaje = "No se pudo identificar al usuario autenticado." });
            }

            if (!modelStateIsValid)
            {
                return TicketWorkflowResultado.BadRequest(new { mensaje = "Los datos enviados no son válidos.", errores = erroresValidacion });
            }

            var ticket = await _context.Tickets
                .Include(t => t.UsuarioSolicitante)
                .Include(t => t.TecnicoAsignado)
                .Include(t => t.EstadoTicket)
                .Include(t => t.Categoria)
                .Include(t => t.Prioridad)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (ticket == null)
            {
                return TicketWorkflowResultado.NotFound(new { mensaje = "Ticket no encontrado." });
            }

            if (ticket.EstadoTicket == null)
            {
                return TicketWorkflowResultado.InternalServerError(new { mensaje = "El ticket no tiene un estado válido asociado." });
            }

            bool esSolicitanteDuenio = ticket.UsuarioSolicitanteId == datosUsuario.Value.UsuarioId;
            bool esAdministradorOJefe = datosUsuario.Value.RolUsuario == "Administrador" || datosUsuario.Value.RolUsuario == "Jefe DTI";

            if (!esSolicitanteDuenio && !esAdministradorOJefe)
            {
                return TicketWorkflowResultado.Forbidden();
            }

            if (ticket.EstadoTicket.Nombre == "Cancelado")
            {
                return TicketWorkflowResultado.BadRequest(new { mensaje = "El ticket ya se encuentra cancelado." });
            }

            if (ticket.EstadoTicket.Nombre == "Cerrado")
            {
                return TicketWorkflowResultado.BadRequest(new { mensaje = "No se puede cancelar un ticket cerrado." });
            }

            if (ticket.EstadoTicket.Nombre == "Resuelto")
            {
                return TicketWorkflowResultado.BadRequest(new { mensaje = "No se puede cancelar un ticket resuelto. Debe cerrarse formalmente o revisarse mediante un nuevo flujo." });
            }

            if (datosUsuario.Value.RolUsuario == "Solicitante" && ticket.EstadoTicket.Nombre != "Abierto")
            {
                return TicketWorkflowResultado.BadRequest(new { mensaje = "El solicitante solo puede cancelar tickets que aún estén en estado 'Abierto'." });
            }

            var estadoCancelado = await _context.EstadosTicket
                .FirstOrDefaultAsync(e => e.Nombre == "Cancelado" && e.Activo);

            if (estadoCancelado == null)
            {
                return TicketWorkflowResultado.InternalServerError(new { mensaje = "No se encontró el estado 'Cancelado'. Verifique los datos base del sistema." });
            }

            ticket.EstadoTicketId = estadoCancelado.Id;
            ticket.MotivoCancelacion = dto.MotivoCancelacion.Trim();
            ticket.FechaCancelacion = DateTime.UtcNow;

            await RegistrarBitacoraAsync(
                ticket.Id,
                datosUsuario.Value.UsuarioId,
                "Ticket cancelado",
                $"El ticket fue cancelado.\n\nMotivo de cancelación: {ticket.MotivoCancelacion}");

            await _context.SaveChangesAsync();

            if (ticket.UsuarioSolicitante != null)
            {
                await EnviarCorreoSeguroAsync(
                    ticket.UsuarioSolicitante.Correo,
                    $"Ticket #{ticket.Id} cancelado - {ticket.Titulo}",
                    TicketEmailTemplateBuilder.CrearCorreoCambioEstado(ticket.UsuarioSolicitante.NombreCompleto, ticket, "Cancelado", ticket.MotivoCancelacion),
                    ticket.Id,
                    "Error notificación cancelación");
            }

            var ticketActualizado = await ObtenerTicketResponsePorIdAsync(ticket.Id);

            return TicketWorkflowResultado.Ok(new
            {
                mensaje = "Ticket cancelado correctamente.",
                ticket = ticketActualizado
            });
        }

        public async Task<TicketWorkflowResultado> ReabrirTicketAsync(int id, ReabrirTicketDto dto, ClaimsPrincipal user, bool modelStateIsValid, object? erroresValidacion)
        {
            var datosUsuario = ObtenerDatosUsuario(user);

            if (datosUsuario == null)
            {
                return TicketWorkflowResultado.Unauthorized(new { mensaje = "No se pudo identificar al usuario autenticado." });
            }

            if (!modelStateIsValid)
            {
                return TicketWorkflowResultado.BadRequest(new { mensaje = "Los datos enviados no son válidos.", errores = erroresValidacion });
            }

            var ticket = await _context.Tickets
                .Include(t => t.UsuarioSolicitante)
                .Include(t => t.TecnicoAsignado)
                .Include(t => t.EstadoTicket)
                .Include(t => t.Categoria)
                .Include(t => t.Prioridad)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (ticket == null)
            {
                return TicketWorkflowResultado.NotFound(new { mensaje = "Ticket no encontrado." });
            }

            if (ticket.EstadoTicket == null)
            {
                return TicketWorkflowResultado.InternalServerError(new { mensaje = "El ticket no tiene un estado válido asociado." });
            }

            bool esSolicitanteDuenio = ticket.UsuarioSolicitanteId == datosUsuario.Value.UsuarioId;
            bool esAdministradorOJefe = datosUsuario.Value.RolUsuario == "Administrador" || datosUsuario.Value.RolUsuario == "Jefe DTI";

            if (!esSolicitanteDuenio && !esAdministradorOJefe)
            {
                return TicketWorkflowResultado.Forbidden();
            }

            if (ticket.EstadoTicket.Nombre == "Cancelado")
            {
                return TicketWorkflowResultado.BadRequest(new { mensaje = "No se puede reabrir un ticket cancelado." });
            }

            if (ticket.EstadoTicket.Nombre == "Abierto")
            {
                return TicketWorkflowResultado.BadRequest(new { mensaje = "El ticket ya se encuentra abierto." });
            }

            if (ticket.EstadoTicket.Nombre == "En proceso")
            {
                return TicketWorkflowResultado.BadRequest(new { mensaje = "No se puede reabrir un ticket que ya está en proceso." });
            }

            if (ticket.EstadoTicket.Nombre == "Escalado")
            {
                return TicketWorkflowResultado.BadRequest(new { mensaje = "No se puede reabrir un ticket escalado." });
            }

            if (ticket.EstadoTicket.Nombre != "Resuelto" && ticket.EstadoTicket.Nombre != "Cerrado")
            {
                return TicketWorkflowResultado.BadRequest(new { mensaje = $"No se puede reabrir un ticket en estado '{ticket.EstadoTicket.Nombre}'." });
            }

            var estadoAbierto = await _context.EstadosTicket
                .FirstOrDefaultAsync(e => e.Nombre == "Abierto" && e.Activo);

            if (estadoAbierto == null)
            {
                return TicketWorkflowResultado.InternalServerError(new { mensaje = "No se encontró el estado 'Abierto'. Verifique los datos base del sistema." });
            }

            ticket.EstadoTicketId = estadoAbierto.Id;
            ticket.MotivoReapertura = dto.MotivoReapertura.Trim();
            ticket.FechaReapertura = DateTime.UtcNow;
            ticket.FechaResolucion = null;
            ticket.FechaCierre = null;
            ticket.ComentarioCierre = null;
            ticket.CalificacionSatisfaccion = null;

            await RegistrarBitacoraAsync(
                ticket.Id,
                datosUsuario.Value.UsuarioId,
                "Ticket reabierto",
                $"El ticket fue reabierto y cambió nuevamente al estado Abierto.\n\nMotivo de reapertura: {ticket.MotivoReapertura}");

            await _context.SaveChangesAsync();

            if (ticket.UsuarioSolicitante != null)
            {
                await EnviarCorreoSeguroAsync(
                    ticket.UsuarioSolicitante.Correo,
                    $"Ticket #{ticket.Id} reabierto - {ticket.Titulo}",
                    TicketEmailTemplateBuilder.CrearCorreoCambioEstado(ticket.UsuarioSolicitante.NombreCompleto, ticket, "Abierto", ticket.MotivoReapertura),
                    ticket.Id,
                    "Error notificación reapertura");
            }

            var ticketActualizado = await ObtenerTicketResponsePorIdAsync(ticket.Id);

            return TicketWorkflowResultado.Ok(new
            {
                mensaje = "Ticket reabierto correctamente.",
                ticket = ticketActualizado
            });
        }

        public async Task<TicketWorkflowResultado> ResolverTicketAsync(int id, ResolverTicketDto dto, ClaimsPrincipal user, bool modelStateIsValid, object? erroresValidacion)
        {
            var datosUsuario = ObtenerDatosUsuario(user);

            if (datosUsuario == null)
            {
                return TicketWorkflowResultado.Unauthorized(new { mensaje = "No se pudo identificar al usuario autenticado." });
            }

            if (!modelStateIsValid)
            {
                return TicketWorkflowResultado.BadRequest(new { mensaje = "Los datos enviados no son válidos.", errores = erroresValidacion });
            }

            var ticket = await _context.Tickets
                .Include(t => t.UsuarioSolicitante)
                .Include(t => t.TecnicoAsignado)
                .Include(t => t.EstadoTicket)
                .Include(t => t.Categoria)
                .Include(t => t.Prioridad)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (ticket == null)
            {
                return TicketWorkflowResultado.NotFound(new { mensaje = "Ticket no encontrado." });
            }

            bool esTecnicoAsignado = ticket.TecnicoAsignadoId == datosUsuario.Value.UsuarioId;
            bool esAdministradorOJefe = datosUsuario.Value.RolUsuario == "Administrador" || datosUsuario.Value.RolUsuario == "Jefe DTI";

            if (!esTecnicoAsignado && !esAdministradorOJefe)
            {
                return TicketWorkflowResultado.Forbidden();
            }

            if (ticket.EstadoTicket == null ||
                (ticket.EstadoTicket.Nombre != "En proceso" && ticket.EstadoTicket.Nombre != "Escalado"))
            {
                return TicketWorkflowResultado.BadRequest(new { mensaje = "Solo se pueden resolver tickets que estén en estado 'En proceso' o 'Escalado'." });
            }

            var estadoResuelto = await _context.EstadosTicket
                .FirstOrDefaultAsync(e => e.Nombre == "Resuelto" && e.Activo);

            if (estadoResuelto == null)
            {
                return TicketWorkflowResultado.InternalServerError(new { mensaje = "No se encontró el estado 'Resuelto'. Verifique los datos base del sistema." });
            }

            ticket.Solucion = dto.Solucion.Trim();
            ticket.EstadoTicketId = estadoResuelto.Id;
            ticket.FechaResolucion = DateTime.UtcNow;

            var solucionBitacora = string.IsNullOrWhiteSpace(ticket.Solucion)
                ? "Sin solución registrada."
                : ticket.Solucion.Trim();

            await RegistrarBitacoraAsync(
                ticket.Id,
                datosUsuario.Value.UsuarioId,
                "Ticket resuelto",
                $"El ticket fue marcado como Resuelto.\n\nSolución aplicada: {solucionBitacora}");

            await _context.SaveChangesAsync();

            if (ticket.UsuarioSolicitante != null)
            {
                await EnviarCorreoSeguroAsync(
                    ticket.UsuarioSolicitante.Correo,
                    $"Ticket #{ticket.Id} resuelto - {ticket.Titulo}",
                    TicketEmailTemplateBuilder.CrearCorreoTicketResuelto(ticket.UsuarioSolicitante.NombreCompleto, ticket),
                    ticket.Id,
                    "Error notificación resolución");
            }

            var ticketActualizado = await ObtenerTicketResponsePorIdAsync(ticket.Id);

            return TicketWorkflowResultado.Ok(new
            {
                mensaje = "Ticket marcado como resuelto correctamente.",
                ticket = ticketActualizado
            });
        }

        public async Task<TicketWorkflowResultado> CerrarTicketAsync(int id, CerrarTicketDto dto, ClaimsPrincipal user, bool modelStateIsValid, object? erroresValidacion)
        {
            var datosUsuario = ObtenerDatosUsuario(user);

            if (datosUsuario == null)
            {
                return TicketWorkflowResultado.Unauthorized(new { mensaje = "No se pudo identificar al usuario autenticado." });
            }

            if (!modelStateIsValid)
            {
                return TicketWorkflowResultado.BadRequest(new { mensaje = "Los datos enviados no son válidos.", errores = erroresValidacion });
            }

            var ticket = await _context.Tickets
                .Include(t => t.UsuarioSolicitante)
                .Include(t => t.TecnicoAsignado)
                .Include(t => t.EstadoTicket)
                .Include(t => t.Categoria)
                .Include(t => t.Prioridad)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (ticket == null)
            {
                return TicketWorkflowResultado.NotFound(new { mensaje = "Ticket no encontrado." });
            }

            bool esSolicitanteDuenio = ticket.UsuarioSolicitanteId == datosUsuario.Value.UsuarioId;
            bool esAdministradorOJefe = datosUsuario.Value.RolUsuario == "Administrador" || datosUsuario.Value.RolUsuario == "Jefe DTI";

            if (!esSolicitanteDuenio && !esAdministradorOJefe)
            {
                return TicketWorkflowResultado.Forbidden();
            }

            if (ticket.EstadoTicket == null || ticket.EstadoTicket.Nombre != "Resuelto")
            {
                return TicketWorkflowResultado.BadRequest(new { mensaje = "Solo se pueden cerrar tickets que estén en estado 'Resuelto'." });
            }

            var estadoCerrado = await _context.EstadosTicket
                .FirstOrDefaultAsync(e => e.Nombre == "Cerrado" && e.Activo);

            if (estadoCerrado == null)
            {
                return TicketWorkflowResultado.InternalServerError(new { mensaje = "No se encontró el estado 'Cerrado'. Verifique los datos base del sistema." });
            }

            ticket.EstadoTicketId = estadoCerrado.Id;
            ticket.FechaCierre = DateTime.UtcNow;
            ticket.ComentarioCierre = string.IsNullOrWhiteSpace(dto.ComentarioCierre)
                ? null
                : dto.ComentarioCierre.Trim();
            ticket.CalificacionSatisfaccion = dto.CalificacionSatisfaccion;

            var comentarioCierreBitacora = string.IsNullOrWhiteSpace(ticket.ComentarioCierre)
                ? "Sin comentario de cierre."
                : ticket.ComentarioCierre.Trim();

            var calificacionBitacora = dto.CalificacionSatisfaccion.HasValue
                ? dto.CalificacionSatisfaccion.Value.ToString()
                : "No registrada";

            await RegistrarBitacoraAsync(
                ticket.Id,
                datosUsuario.Value.UsuarioId,
                "Ticket cerrado",
                $"El ticket fue cerrado formalmente.\n\nComentario de cierre: {comentarioCierreBitacora}\n\nCalificación de satisfacción: {calificacionBitacora}.");

            await _context.SaveChangesAsync();

            if (ticket.UsuarioSolicitante != null)
            {
                await EnviarCorreoSeguroAsync(
                    ticket.UsuarioSolicitante.Correo,
                    $"Ticket #{ticket.Id} cerrado - {ticket.Titulo}",
                    TicketEmailTemplateBuilder.CrearCorreoCambioEstado(ticket.UsuarioSolicitante.NombreCompleto, ticket, "Cerrado", ticket.ComentarioCierre),
                    ticket.Id,
                    "Error notificación cierre");
            }

            var ticketActualizado = await ObtenerTicketResponsePorIdAsync(ticket.Id);

            return TicketWorkflowResultado.Ok(new
            {
                mensaje = "Ticket cerrado correctamente.",
                ticket = ticketActualizado
            });
        }

        private static (int UsuarioId, string? RolUsuario)? ObtenerDatosUsuario(ClaimsPrincipal user)
        {
            var usuarioIdClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var rolUsuario = user.FindFirst(ClaimTypes.Role)?.Value;

            if (string.IsNullOrWhiteSpace(usuarioIdClaim) || !int.TryParse(usuarioIdClaim, out int usuarioId))
            {
                return null;
            }

            return (usuarioId, rolUsuario);
        }

        private async Task<TicketResponseDto> ObtenerTicketResponsePorIdAsync(int ticketId)
        {
            var ticket = await _context.Tickets
                .Include(t => t.UsuarioSolicitante)
                .Include(t => t.TecnicoAsignado)
                .Include(t => t.Categoria)
                .Include(t => t.EstadoTicket)
                .Include(t => t.Prioridad)
                .FirstAsync(t => t.Id == ticketId);

            return TicketResponseMapper.ToResponseDto(ticket);
        }

        private async Task RegistrarBitacoraAsync(int ticketId, int usuarioId, string accion, string? detalle)
        {
            var registro = new BitacoraAuditoria
            {
                TicketId = ticketId,
                UsuarioId = usuarioId,
                Accion = accion,
                Detalle = detalle,
                FechaRegistro = DateTime.UtcNow
            };

            await _context.BitacoraAuditoria.AddAsync(registro);
        }

        private static bool UsuarioTienePermisoSobreTicket(Ticket ticket, int usuarioId, string? rolUsuario)
        {
            if (rolUsuario == "Administrador" || rolUsuario == "Jefe DTI")
            {
                return true;
            }

            if (rolUsuario == "Solicitante" && ticket.UsuarioSolicitanteId == usuarioId)
            {
                return true;
            }

            if (rolUsuario == "Técnico" && ticket.TecnicoAsignadoId == usuarioId)
            {
                return true;
            }

            return false;
        }

        private async Task<Prioridad?> ObtenerPrioridadAsync(string impacto, string urgencia)
        {
            string impactoNormalizado = NormalizarTexto(impacto);
            string urgenciaNormalizada = NormalizarTexto(urgencia);

            var registroMatriz = await _context.MatrizPrioridades
                .Include(m => m.Prioridad)
                .FirstOrDefaultAsync(m =>
                    m.Activo &&
                    m.Impacto == impactoNormalizado &&
                    m.Urgencia == urgenciaNormalizada &&
                    m.Prioridad != null &&
                    m.Prioridad.Activo);

            return registroMatriz?.Prioridad;
        }

        private static string NormalizarTexto(string valor)
        {
            if (string.IsNullOrWhiteSpace(valor))
            {
                return string.Empty;
            }

            valor = valor.Trim().ToLower();

            return valor switch
            {
                "alto" => "Alto",
                "medio" => "Medio",
                "bajo" => "Bajo",
                "alta" => "Alta",
                "media" => "Media",
                "baja" => "Baja",
                _ => valor
            };
        }

        private async Task EnviarCorreoSeguroAsync(
            string? destinatario,
            string asunto,
            string contenidoHtml,
            int ticketId,
            string accionFallo)
        {
            if (string.IsNullOrWhiteSpace(destinatario))
            {
                return;
            }

            try
            {
                await _emailService.EnviarCorreoAsync(destinatario, asunto, contenidoHtml);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "No se pudo enviar correo para el ticket {TicketId}. Acción: {Accion}", ticketId, accionFallo);
            }
        }
    }
}