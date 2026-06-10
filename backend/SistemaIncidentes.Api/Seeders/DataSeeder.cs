using Microsoft.EntityFrameworkCore;
using SistemaIncidentes.Api.Data;
using SistemaIncidentes.Api.Models;

namespace SistemaIncidentes.Api.Seeders
{
    public static class DataSeeder
    {
        public static async Task SeedAsync(ApplicationDbContext context)
        {
            await context.Database.MigrateAsync();

            await SeedRolesAsync(context);
            await SeedEstadosTicketAsync(context);
            await SeedPrioridadesAsync(context);
            await SeedCategoriasAsync(context);
        }

        private static async Task SeedRolesAsync(ApplicationDbContext context)
        {
            var rolesBase = new List<Rol>
            {
                new Rol
                {
                    Nombre = "Administrador",
                    Descripcion = "Usuario con acceso completo a la administración del sistema."
                },
                new Rol
                {
                    Nombre = "Jefe DTI",
                    Descripcion = "Usuario responsable de supervisar tickets, asignaciones, métricas y escalaciones."
                },
                new Rol
                {
                    Nombre = "Técnico",
                    Descripcion = "Usuario encargado de atender, actualizar y resolver tickets asignados."
                },
                new Rol
                {
                    Nombre = "Solicitante",
                    Descripcion = "Usuario que registra incidentes y consulta el seguimiento de sus tickets."
                }
            };

            foreach (var rol in rolesBase)
            {
                bool existeRol = await context.Roles
                    .AnyAsync(r => r.Nombre == rol.Nombre);

                if (!existeRol)
                {
                    context.Roles.Add(rol);
                }
            }

            await context.SaveChangesAsync();
        }

        private static async Task SeedEstadosTicketAsync(ApplicationDbContext context)
        {
            if (await context.EstadosTicket.AnyAsync())
            {
                return;
            }

            var estados = new List<EstadoTicket>
            {
                new EstadoTicket
                {
                    Nombre = "Abierto",
                    Descripcion = "Ticket registrado y pendiente de atención."
                },
                new EstadoTicket
                {
                    Nombre = "En proceso",
                    Descripcion = "Ticket en revisión o atención por parte del equipo técnico."
                },
                new EstadoTicket
                {
                    Nombre = "Escalado",
                    Descripcion = "Ticket transferido a un nivel superior de soporte o responsable especializado."
                },
                new EstadoTicket
                {
                    Nombre = "Resuelto",
                    Descripcion = "Ticket con solución aplicada, pendiente de validación o cierre."
                },
                new EstadoTicket
                {
                    Nombre = "Cerrado",
                    Descripcion = "Ticket finalizado con evidencia de atención o confirmación de cierre."
                },
                new EstadoTicket
                {
                    Nombre = "Cancelado",
                    Descripcion = "Ticket anulado por duplicidad, error de registro o falta de procedencia."
                }
            };

            context.EstadosTicket.AddRange(estados);
            await context.SaveChangesAsync();
        }

        private static async Task SeedPrioridadesAsync(ApplicationDbContext context)
        {
            if (await context.Prioridades.AnyAsync())
            {
                return;
            }

            var prioridades = new List<Prioridad>
            {
                new Prioridad
                {
                    Nombre = "Baja",
                    Descripcion = "Incidente con bajo impacto operativo y atención no urgente.",
                    TiempoRespuestaHoras = 8,
                    TiempoResolucionHoras = 72
                },
                new Prioridad
                {
                    Nombre = "Media",
                    Descripcion = "Incidente con impacto moderado sobre un usuario o área específica.",
                    TiempoRespuestaHoras = 4,
                    TiempoResolucionHoras = 48
                },
                new Prioridad
                {
                    Nombre = "Alta",
                    Descripcion = "Incidente que afecta procesos importantes o múltiples usuarios.",
                    TiempoRespuestaHoras = 2,
                    TiempoResolucionHoras = 24
                },
                new Prioridad
                {
                    Nombre = "Critica",
                    Descripcion = "Incidente critico que afecta servicios esenciales, continuidad operativa o seguridad de la informacion.",
                    TiempoRespuestaHoras = 1,
                    TiempoResolucionHoras = 4
                }
            };

            context.Prioridades.AddRange(prioridades);
            await context.SaveChangesAsync();
        }

        private static async Task SeedCategoriasAsync(ApplicationDbContext context)
        {
            if (await context.Categorias.AnyAsync())
            {
                return;
            }

            var categorias = new List<Categoria>
            {
                new Categoria
                {
                    Nombre = "Hardware",
                    Descripcion = "Incidentes relacionados con equipos físicos, periféricos o componentes."
                },
                new Categoria
                {
                    Nombre = "Software",
                    Descripcion = "Incidentes relacionados con aplicaciones, programas o sistemas instalados."
                },
                new Categoria
                {
                    Nombre = "Red",
                    Descripcion = "Incidentes relacionados con conectividad, internet, red interna o acceso a servicios."
                },
                new Categoria
                {
                    Nombre = "Correo institucional",
                    Descripcion = "Incidentes relacionados con cuentas, acceso o funcionamiento del correo institucional."
                },
                new Categoria
                {
                    Nombre = "Plataforma virtual",
                    Descripcion = "Incidentes relacionados con la plataforma educativa o entorno virtual de aprendizaje."
                },
                new Categoria
                {
                    Nombre = "Sistema académico",
                    Descripcion = "Incidentes relacionados con acceso o funcionamiento del sistema de gestión académica."
                },
                new Categoria
                {
                    Nombre = "Seguridad informática",
                    Descripcion = "Incidentes relacionados con accesos no autorizados, malware, cuentas comprometidas o riesgos de seguridad."
                },
                new Categoria
                {
                    Nombre = "Otro",
                    Descripcion = "Incidentes que no encajan directamente en las categorías principales."
                }
            };

            context.Categorias.AddRange(categorias);
            await context.SaveChangesAsync();
        }
    }
}