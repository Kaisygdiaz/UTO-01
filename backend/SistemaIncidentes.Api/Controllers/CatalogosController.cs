using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaIncidentes.Api.Data;
using SistemaIncidentes.Api.DTOs;
using SistemaIncidentes.Api.Models;

namespace SistemaIncidentes.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CatalogosController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CatalogosController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("categorias")]
        public async Task<IActionResult> ObtenerCategorias([FromQuery] bool incluirInactivos = false)
        {
            var datosUsuario = ObtenerDatosUsuario();
            bool puedeVerInactivos = datosUsuario != null && EsAdministradorOJefe(datosUsuario.Value.RolUsuario);

            var query = _context.Categorias.AsQueryable();

            if (!incluirInactivos || !puedeVerInactivos)
            {
                query = query.Where(c => c.Activo);
            }

            var categorias = await query
                .OrderBy(c => c.Nombre)
                .Select(c => new CategoriaAdministracionResponseDto
                {
                    Id = c.Id,
                    Nombre = c.Nombre,
                    Descripcion = c.Descripcion,
                    Activo = c.Activo,
                    FechaCreacion = c.FechaCreacion,
                    FechaActualizacion = c.FechaActualizacion
                })
                .ToListAsync();

            return Ok(categorias);
        }

        [HttpPost("categorias")]
        public async Task<IActionResult> CrearCategoria([FromBody] CrearActualizarCategoriaDto dto)
        {
            if (!UsuarioActualPuedeAdministrar())
            {
                return Forbid();
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(new { mensaje = "Los datos enviados no son válidos.", errores = ModelState });
            }

            string nombre = dto.Nombre.Trim();
            string nombreNormalizado = nombre.ToLower();

            bool existe = await _context.Categorias.AnyAsync(c => c.Nombre.ToLower() == nombreNormalizado);

            if (existe)
            {
                return BadRequest(new { mensaje = "Ya existe una categoría con ese nombre." });
            }

            var categoria = new Categoria
            {
                Nombre = nombre,
                Descripcion = string.IsNullOrWhiteSpace(dto.Descripcion) ? null : dto.Descripcion.Trim(),
                Activo = true,
                FechaCreacion = DateTime.UtcNow
            };

            _context.Categorias.Add(categoria);

            await RegistrarBitacoraSistemaAsync(
                "Categorías",
                "Categoría creada",
                $"Se creó la categoría '{categoria.Nombre}'.");

            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(ObtenerCategorias), new { id = categoria.Id }, new
            {
                mensaje = "Categoría creada correctamente.",
                categoria = CrearCategoriaResponse(categoria)
            });
        }

        [HttpPut("categorias/{id:int}")]
        public async Task<IActionResult> ActualizarCategoria(int id, [FromBody] CrearActualizarCategoriaDto dto)
        {
            if (!UsuarioActualPuedeAdministrar())
            {
                return Forbid();
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(new { mensaje = "Los datos enviados no son válidos.", errores = ModelState });
            }

            var categoria = await _context.Categorias.FirstOrDefaultAsync(c => c.Id == id);

            if (categoria == null)
            {
                return NotFound(new { mensaje = "Categoría no encontrada." });
            }

            string nombre = dto.Nombre.Trim();
            string nombreNormalizado = nombre.ToLower();

            bool existeOtro = await _context.Categorias.AnyAsync(c => c.Id != id && c.Nombre.ToLower() == nombreNormalizado);

            if (existeOtro)
            {
                return BadRequest(new { mensaje = "Ya existe otra categoría con ese nombre." });
            }

            string nombreAnterior = categoria.Nombre;
            string descripcionAnterior = categoria.Descripcion ?? "Sin descripción";

            categoria.Nombre = nombre;
            categoria.Descripcion = string.IsNullOrWhiteSpace(dto.Descripcion) ? null : dto.Descripcion.Trim();
            categoria.FechaActualizacion = DateTime.UtcNow;

            await RegistrarBitacoraSistemaAsync(
                "Categorías",
                "Categoría actualizada",
                $"Se actualizó la categoría ID {categoria.Id}. Nombre anterior: '{nombreAnterior}', nuevo nombre: '{categoria.Nombre}'. " +
                $"Descripción anterior: '{descripcionAnterior}', nueva descripción: '{categoria.Descripcion ?? "Sin descripción"}'.");

            await _context.SaveChangesAsync();

            return Ok(new
            {
                mensaje = "Categoría actualizada correctamente.",
                categoria = CrearCategoriaResponse(categoria)
            });
        }

        [HttpPut("categorias/{id:int}/estado")]
        public async Task<IActionResult> CambiarEstadoCategoria(int id, [FromBody] CambiarEstadoCatalogoDto dto)
        {
            if (!UsuarioActualPuedeAdministrar())
            {
                return Forbid();
            }

            var categoria = await _context.Categorias.FirstOrDefaultAsync(c => c.Id == id);

            if (categoria == null)
            {
                return NotFound(new { mensaje = "Categoría no encontrada." });
            }

            bool estadoAnterior = categoria.Activo;

            categoria.Activo = dto.Activo;
            categoria.FechaActualizacion = DateTime.UtcNow;

            await RegistrarBitacoraSistemaAsync(
                "Categorías",
                dto.Activo ? "Categoría activada" : "Categoría desactivada",
                $"Se cambió el estado de la categoría '{categoria.Nombre}'. Estado anterior: {(estadoAnterior ? "Activa" : "Inactiva")}, " +
                $"nuevo estado: {(dto.Activo ? "Activa" : "Inactiva")}.");

            await _context.SaveChangesAsync();

            return Ok(new
            {
                mensaje = dto.Activo ? "Categoría activada correctamente." : "Categoría desactivada correctamente.",
                categoria = CrearCategoriaResponse(categoria)
            });
        }

        [HttpGet("prioridades")]
        public async Task<IActionResult> ObtenerPrioridades([FromQuery] bool incluirInactivos = false)
        {
            var datosUsuario = ObtenerDatosUsuario();
            bool puedeVerInactivos = datosUsuario != null && EsAdministradorOJefe(datosUsuario.Value.RolUsuario);

            var query = _context.Prioridades.AsQueryable();

            if (!incluirInactivos || !puedeVerInactivos)
            {
                query = query.Where(p => p.Activo);
            }

            var prioridades = await query
                .OrderBy(p => p.Id)
                .Select(p => new PrioridadAdministracionResponseDto
                {
                    Id = p.Id,
                    Nombre = p.Nombre,
                    Descripcion = p.Descripcion,
                    TiempoRespuestaHoras = p.TiempoRespuestaHoras,
                    TiempoResolucionHoras = p.TiempoResolucionHoras,
                    Activo = p.Activo,
                    FechaActualizacion = p.FechaActualizacion
                })
                .ToListAsync();

            return Ok(prioridades);
        }

        [HttpPost("prioridades")]
        public async Task<IActionResult> CrearPrioridad([FromBody] CrearActualizarPrioridadDto dto)
        {
            if (!UsuarioActualPuedeAdministrar())
            {
                return Forbid();
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(new { mensaje = "Los datos enviados no son válidos.", errores = ModelState });
            }

            var validacion = ValidarTiemposPrioridad(dto.TiempoRespuestaHoras, dto.TiempoResolucionHoras);

            if (validacion != null)
            {
                return BadRequest(new { mensaje = validacion });
            }

            string nombre = dto.Nombre.Trim();
            string nombreNormalizado = nombre.ToLower();

            bool existe = await _context.Prioridades.AnyAsync(p => p.Nombre.ToLower() == nombreNormalizado);

            if (existe)
            {
                return BadRequest(new { mensaje = "Ya existe una prioridad con ese nombre." });
            }

            var prioridad = new Prioridad
            {
                Nombre = nombre,
                Descripcion = string.IsNullOrWhiteSpace(dto.Descripcion) ? null : dto.Descripcion.Trim(),
                TiempoRespuestaHoras = dto.TiempoRespuestaHoras,
                TiempoResolucionHoras = dto.TiempoResolucionHoras,
                Activo = true,
                FechaActualizacion = DateTime.UtcNow
            };

            _context.Prioridades.Add(prioridad);

            await RegistrarBitacoraSistemaAsync(
                "Prioridades SLA",
                "Prioridad creada",
                $"Se creó la prioridad '{prioridad.Nombre}' con tiempo de respuesta {prioridad.TiempoRespuestaHoras}h y resolución {prioridad.TiempoResolucionHoras}h.");

            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(ObtenerPrioridades), new { id = prioridad.Id }, new
            {
                mensaje = "Prioridad creada correctamente.",
                prioridad = CrearPrioridadResponse(prioridad)
            });
        }

        [HttpPut("prioridades/{id:int}")]
        public async Task<IActionResult> ActualizarPrioridad(int id, [FromBody] CrearActualizarPrioridadDto dto)
        {
            if (!UsuarioActualPuedeAdministrar())
            {
                return Forbid();
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(new { mensaje = "Los datos enviados no son válidos.", errores = ModelState });
            }

            var validacion = ValidarTiemposPrioridad(dto.TiempoRespuestaHoras, dto.TiempoResolucionHoras);

            if (validacion != null)
            {
                return BadRequest(new { mensaje = validacion });
            }

            var prioridad = await _context.Prioridades.FirstOrDefaultAsync(p => p.Id == id);

            if (prioridad == null)
            {
                return NotFound(new { mensaje = "Prioridad no encontrada." });
            }

            string nombre = dto.Nombre.Trim();
            string nombreNormalizado = nombre.ToLower();

            bool existeOtro = await _context.Prioridades.AnyAsync(p => p.Id != id && p.Nombre.ToLower() == nombreNormalizado);

            if (existeOtro)
            {
                return BadRequest(new { mensaje = "Ya existe otra prioridad con ese nombre." });
            }

            string nombreAnterior = prioridad.Nombre;
            string descripcionAnterior = prioridad.Descripcion ?? "Sin descripción";
            int respuestaAnterior = prioridad.TiempoRespuestaHoras;
            int resolucionAnterior = prioridad.TiempoResolucionHoras;

            prioridad.Nombre = nombre;
            prioridad.Descripcion = string.IsNullOrWhiteSpace(dto.Descripcion) ? null : dto.Descripcion.Trim();
            prioridad.TiempoRespuestaHoras = dto.TiempoRespuestaHoras;
            prioridad.TiempoResolucionHoras = dto.TiempoResolucionHoras;
            prioridad.FechaActualizacion = DateTime.UtcNow;

            await RegistrarBitacoraSistemaAsync(
                "Prioridades SLA",
                "Prioridad actualizada",
                $"Se actualizó la prioridad ID {prioridad.Id}. Nombre anterior: '{nombreAnterior}', nuevo nombre: '{prioridad.Nombre}'. " +
                $"Respuesta anterior: {respuestaAnterior}h, nueva respuesta: {prioridad.TiempoRespuestaHoras}h. " +
                $"Resolución anterior: {resolucionAnterior}h, nueva resolución: {prioridad.TiempoResolucionHoras}h. " +
                $"Descripción anterior: '{descripcionAnterior}', nueva descripción: '{prioridad.Descripcion ?? "Sin descripción"}'.");

            await _context.SaveChangesAsync();

            return Ok(new
            {
                mensaje = "Prioridad actualizada correctamente.",
                prioridad = CrearPrioridadResponse(prioridad)
            });
        }

        [HttpPut("prioridades/{id:int}/estado")]
        public async Task<IActionResult> CambiarEstadoPrioridad(int id, [FromBody] CambiarEstadoCatalogoDto dto)
        {
            if (!UsuarioActualPuedeAdministrar())
            {
                return Forbid();
            }

            var prioridad = await _context.Prioridades.FirstOrDefaultAsync(p => p.Id == id);

            if (prioridad == null)
            {
                return NotFound(new { mensaje = "Prioridad no encontrada." });
            }

            bool estadoAnterior = prioridad.Activo;

            if (!dto.Activo)
            {
                bool usadaEnMatrizActiva = await _context.MatrizPrioridades.AnyAsync(m =>
                    m.PrioridadId == id &&
                    m.Activo);

                if (usadaEnMatrizActiva)
                {
                    return BadRequest(new
                    {
                        mensaje = "No se puede desactivar esta prioridad porque está siendo utilizada en la matriz impacto-urgencia activa. Cambie primero la matriz."
                    });
                }
            }

            prioridad.Activo = dto.Activo;
            prioridad.FechaActualizacion = DateTime.UtcNow;

            await RegistrarBitacoraSistemaAsync(
                "Prioridades SLA",
                dto.Activo ? "Prioridad activada" : "Prioridad desactivada",
                $"Se cambió el estado de la prioridad '{prioridad.Nombre}'. Estado anterior: {(estadoAnterior ? "Activa" : "Inactiva")}, " +
                $"nuevo estado: {(dto.Activo ? "Activa" : "Inactiva")}.");

            await _context.SaveChangesAsync();

            return Ok(new
            {
                mensaje = dto.Activo ? "Prioridad activada correctamente." : "Prioridad desactivada correctamente.",
                prioridad = CrearPrioridadResponse(prioridad)
            });
        }

        [HttpGet("estados-ticket")]
        public async Task<IActionResult> ObtenerEstadosTicket()
        {
            var estados = await _context.EstadosTicket
                .Where(e => e.Activo)
                .OrderBy(e => e.Id)
                .Select(e => new
                {
                    e.Id,
                    e.Nombre,
                    e.Descripcion
                })
                .ToListAsync();

            return Ok(estados);
        }

        [HttpGet("tecnicos")]
        public async Task<IActionResult> ObtenerTecnicos()
        {
            var datosUsuario = ObtenerDatosUsuario();

            if (datosUsuario == null || !EsAdministradorOJefe(datosUsuario.Value.RolUsuario))
            {
                return Forbid();
            }

            var tecnicos = await _context.Usuarios
                .Include(u => u.Rol)
                .Where(u =>
                    u.Activo &&
                    u.Rol != null &&
                    u.Rol.Nombre == "Técnico")
                .OrderBy(u => u.NombreCompleto)
                .Select(u => new
                {
                    u.Id,
                    u.NombreCompleto,
                    u.Correo
                })
                .ToListAsync();

            return Ok(tecnicos);
        }

        [HttpGet("matriz-prioridad")]
        public async Task<IActionResult> ObtenerMatrizPrioridad()
        {
            if (!UsuarioActualPuedeAdministrar())
            {
                return Forbid();
            }

            var matriz = await _context.MatrizPrioridades
                .Include(m => m.Prioridad)
                .OrderBy(m => m.Impacto)
                .ThenBy(m => m.Urgencia)
                .Select(m => new MatrizPrioridadResponseDto
                {
                    Id = m.Id,
                    Impacto = m.Impacto,
                    Urgencia = m.Urgencia,
                    PrioridadId = m.PrioridadId,
                    Prioridad = m.Prioridad != null ? m.Prioridad.Nombre : string.Empty,
                    Activo = m.Activo,
                    FechaCreacion = m.FechaCreacion,
                    FechaActualizacion = m.FechaActualizacion
                })
                .ToListAsync();

            return Ok(matriz);
        }

        [HttpPut("matriz-prioridad/{id:int}")]
        public async Task<IActionResult> ActualizarMatrizPrioridad(int id, [FromBody] ActualizarMatrizPrioridadDto dto)
        {
            if (!UsuarioActualPuedeAdministrar())
            {
                return Forbid();
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(new { mensaje = "Los datos enviados no son válidos.", errores = ModelState });
            }

            var matriz = await _context.MatrizPrioridades
                .Include(m => m.Prioridad)
                .FirstOrDefaultAsync(m => m.Id == id);

            if (matriz == null)
            {
                return NotFound(new { mensaje = "Registro de matriz no encontrado." });
            }

            var prioridad = await _context.Prioridades.FirstOrDefaultAsync(p => p.Id == dto.PrioridadId && p.Activo);

            if (prioridad == null)
            {
                return BadRequest(new { mensaje = "La prioridad seleccionada no existe o se encuentra inactiva." });
            }

            string prioridadAnterior = matriz.Prioridad != null ? matriz.Prioridad.Nombre : "Sin prioridad";

            matriz.PrioridadId = prioridad.Id;
            matriz.FechaActualizacion = DateTime.UtcNow;

            await RegistrarBitacoraSistemaAsync(
                "Matriz prioridad",
                "Matriz actualizada",
                $"Se actualizó la combinación impacto '{matriz.Impacto}' y urgencia '{matriz.Urgencia}'. " +
                $"Prioridad anterior: '{prioridadAnterior}', nueva prioridad: '{prioridad.Nombre}'.");

            await _context.SaveChangesAsync();

            return Ok(new
            {
                mensaje = "Matriz de prioridad actualizada correctamente.",
                matriz = new MatrizPrioridadResponseDto
                {
                    Id = matriz.Id,
                    Impacto = matriz.Impacto,
                    Urgencia = matriz.Urgencia,
                    PrioridadId = prioridad.Id,
                    Prioridad = prioridad.Nombre,
                    Activo = matriz.Activo,
                    FechaCreacion = matriz.FechaCreacion,
                    FechaActualizacion = matriz.FechaActualizacion
                }
            });
        }

        [HttpGet("configuracion-sla")]
        public async Task<IActionResult> ObtenerConfiguracionSla()
        {
            if (!UsuarioActualPuedeAdministrar())
            {
                return Forbid();
            }

            var configuracion = await ObtenerOCrearConfiguracionSlaAsync();

            return Ok(CrearConfiguracionSlaResponse(configuracion));
        }

        [HttpPut("configuracion-sla")]
        public async Task<IActionResult> ActualizarConfiguracionSla([FromBody] ActualizarConfiguracionSlaDto dto)
        {
            if (!UsuarioActualPuedeAdministrar())
            {
                return Forbid();
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(new { mensaje = "Los datos enviados no son válidos.", errores = ModelState });
            }

            var datosUsuario = ObtenerDatosUsuario();
            var configuracion = await ObtenerOCrearConfiguracionSlaAsync();

            bool habilitadoAnterior = configuracion.Habilitado;
            int intervaloAnterior = configuracion.IntervaloRevisionMinutos;
            int porcentajeAnterior = configuracion.PorcentajeProximoVencimiento;

            configuracion.Habilitado = dto.Habilitado;
            configuracion.IntervaloRevisionMinutos = dto.IntervaloRevisionMinutos;
            configuracion.PorcentajeProximoVencimiento = dto.PorcentajeProximoVencimiento;
            configuracion.FechaActualizacion = DateTime.UtcNow;
            configuracion.UsuarioActualizacionId = datosUsuario?.UsuarioId;

            await RegistrarBitacoraSistemaAsync(
                "Configuración SLA",
                "Configuración SLA actualizada",
                $"Se actualizó la configuración SLA. Habilitado anterior: {(habilitadoAnterior ? "Sí" : "No")}, nuevo: {(dto.Habilitado ? "Sí" : "No")}. " +
                $"Intervalo anterior: {intervaloAnterior} minutos, nuevo intervalo: {dto.IntervaloRevisionMinutos} minutos. " +
                $"Porcentaje anterior: {porcentajeAnterior}%, nuevo porcentaje: {dto.PorcentajeProximoVencimiento}%.");

            await _context.SaveChangesAsync();

            var configuracionActualizada = await _context.ConfiguracionesSla
                .Include(c => c.UsuarioActualizacion)
                .FirstAsync(c => c.Id == configuracion.Id);

            return Ok(new
            {
                mensaje = "Configuración SLA actualizada correctamente.",
                configuracion = CrearConfiguracionSlaResponse(configuracionActualizada)
            });
        }

        [HttpGet("bitacora-sistema")]
        public async Task<IActionResult> ObtenerBitacoraSistema(
            [FromQuery] string? modulo,
            [FromQuery] DateTime? fechaInicio,
            [FromQuery] DateTime? fechaFin)
        {
            if (!UsuarioActualPuedeAdministrar())
            {
                return Forbid();
            }

            var query = _context.BitacoraSistema
                .Include(b => b.Usuario)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(modulo))
            {
                string moduloNormalizado = modulo.Trim().ToLower();

                query = query.Where(b => b.Modulo.ToLower() == moduloNormalizado);
            }

            if (fechaInicio.HasValue && fechaFin.HasValue && fechaInicio.Value.Date > fechaFin.Value.Date)
            {
                return BadRequest(new { mensaje = "La fecha de inicio no puede ser mayor que la fecha fin." });
            }

            if (fechaInicio.HasValue)
            {
                var inicio = DateTime.SpecifyKind(fechaInicio.Value.Date, DateTimeKind.Utc);
                query = query.Where(b => b.FechaRegistro >= inicio);
            }

            if (fechaFin.HasValue)
            {
                var fin = DateTime.SpecifyKind(fechaFin.Value.Date.AddDays(1), DateTimeKind.Utc);
                query = query.Where(b => b.FechaRegistro < fin);
            }

            var registros = await query
                .OrderByDescending(b => b.FechaRegistro)
                .Take(200)
                .Select(b => new BitacoraSistemaResponseDto
                {
                    Id = b.Id,
                    Usuario = b.Usuario != null ? b.Usuario.NombreCompleto : string.Empty,
                    CorreoUsuario = b.Usuario != null ? b.Usuario.Correo : string.Empty,
                    Modulo = b.Modulo,
                    Accion = b.Accion,
                    Detalle = b.Detalle,
                    FechaRegistro = b.FechaRegistro
                })
                .ToListAsync();

            return Ok(new
            {
                total = registros.Count,
                registros
            });
        }

        private async Task<ConfiguracionSla> ObtenerOCrearConfiguracionSlaAsync()
        {
            var configuracion = await _context.ConfiguracionesSla
                .Include(c => c.UsuarioActualizacion)
                .FirstOrDefaultAsync();

            if (configuracion != null)
            {
                return configuracion;
            }

            configuracion = new ConfiguracionSla
            {
                Habilitado = true,
                IntervaloRevisionMinutos = 1,
                PorcentajeProximoVencimiento = 25,
                FechaCreacion = DateTime.UtcNow
            };

            _context.ConfiguracionesSla.Add(configuracion);
            await _context.SaveChangesAsync();

            return configuracion;
        }

        private bool UsuarioActualPuedeAdministrar()
        {
            var datosUsuario = ObtenerDatosUsuario();

            if (datosUsuario == null)
            {
                return false;
            }

            return EsAdministradorOJefe(datosUsuario.Value.RolUsuario);
        }

        private (int UsuarioId, string? RolUsuario)? ObtenerDatosUsuario()
        {
            var usuarioIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var rolUsuario = User.FindFirst(ClaimTypes.Role)?.Value;

            if (string.IsNullOrWhiteSpace(usuarioIdClaim) || !int.TryParse(usuarioIdClaim, out int usuarioId))
            {
                return null;
            }

            return (usuarioId, rolUsuario);
        }

        private static bool EsAdministradorOJefe(string? rolUsuario)
        {
            return rolUsuario == "Administrador" || rolUsuario == "Jefe DTI";
        }

        private static string? ValidarTiemposPrioridad(int tiempoRespuestaHoras, int tiempoResolucionHoras)
        {
            if (tiempoRespuestaHoras <= 0)
            {
                return "El tiempo de respuesta debe ser mayor a cero.";
            }

            if (tiempoResolucionHoras <= 0)
            {
                return "El tiempo de resolución debe ser mayor a cero.";
            }

            if (tiempoRespuestaHoras > tiempoResolucionHoras)
            {
                return "El tiempo de respuesta no puede ser mayor que el tiempo de resolución.";
            }

            return null;
        }

        private async Task RegistrarBitacoraSistemaAsync(string modulo, string accion, string? detalle)
        {
            var datosUsuario = ObtenerDatosUsuario();

            if (datosUsuario == null)
            {
                return;
            }

            var registro = new BitacoraSistema
            {
                UsuarioId = datosUsuario.Value.UsuarioId,
                Modulo = modulo,
                Accion = accion,
                Detalle = detalle,
                FechaRegistro = DateTime.UtcNow
            };

            await _context.BitacoraSistema.AddAsync(registro);
        }

        private static CategoriaAdministracionResponseDto CrearCategoriaResponse(Categoria categoria)
        {
            return new CategoriaAdministracionResponseDto
            {
                Id = categoria.Id,
                Nombre = categoria.Nombre,
                Descripcion = categoria.Descripcion,
                Activo = categoria.Activo,
                FechaCreacion = categoria.FechaCreacion,
                FechaActualizacion = categoria.FechaActualizacion
            };
        }

        private static PrioridadAdministracionResponseDto CrearPrioridadResponse(Prioridad prioridad)
        {
            return new PrioridadAdministracionResponseDto
            {
                Id = prioridad.Id,
                Nombre = prioridad.Nombre,
                Descripcion = prioridad.Descripcion,
                TiempoRespuestaHoras = prioridad.TiempoRespuestaHoras,
                TiempoResolucionHoras = prioridad.TiempoResolucionHoras,
                Activo = prioridad.Activo,
                FechaActualizacion = prioridad.FechaActualizacion
            };
        }

        private static ConfiguracionSlaResponseDto CrearConfiguracionSlaResponse(ConfiguracionSla configuracion)
        {
            return new ConfiguracionSlaResponseDto
            {
                Id = configuracion.Id,
                Habilitado = configuracion.Habilitado,
                IntervaloRevisionMinutos = configuracion.IntervaloRevisionMinutos,
                PorcentajeProximoVencimiento = configuracion.PorcentajeProximoVencimiento,
                FechaCreacion = configuracion.FechaCreacion,
                FechaActualizacion = configuracion.FechaActualizacion,
                ActualizadoPor = configuracion.UsuarioActualizacion?.NombreCompleto
            };
        }
    }
}