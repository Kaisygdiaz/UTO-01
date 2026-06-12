using System.Security.Claims;
using System.Security.Cryptography;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaIncidentes.Api.Data;
using SistemaIncidentes.Api.DTOs;
using SistemaIncidentes.Api.Models;
using SistemaIncidentes.Api.Services;

namespace SistemaIncidentes.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsuariosController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly IEmailService _emailService;

        public UsuariosController(
            ApplicationDbContext context,
            IConfiguration configuration,
            IEmailService emailService)
        {
            _context = context;
            _configuration = configuration;
            _emailService = emailService;
        }

        [HttpGet("perfil")]
        public async Task<IActionResult> ObtenerPerfil()
        {
            var usuarioIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrWhiteSpace(usuarioIdClaim))
            {
                return Unauthorized(new { mensaje = "No se pudo identificar al usuario autenticado." });
            }

            if (!int.TryParse(usuarioIdClaim, out int usuarioId))
            {
                return Unauthorized(new { mensaje = "El identificador del usuario no es válido." });
            }

            var usuario = await _context.Usuarios
                .Include(u => u.Rol)
                .Where(u => u.Id == usuarioId && u.Activo)
                .Select(u => new UsuarioResponseDto
                {
                    Id = u.Id,
                    NombreCompleto = u.NombreCompleto,
                    Correo = u.Correo,
                    Telefono = u.Telefono,
                    Rol = u.Rol != null ? u.Rol.Nombre : "Sin rol",
                    Activo = u.Activo,
                    EmailConfirmado = u.EmailConfirmado,
                    FechaCreacion = u.FechaCreacion
                })
                .FirstOrDefaultAsync();

            if (usuario == null)
            {
                return NotFound(new { mensaje = "Usuario no encontrado o inactivo." });
            }

            return Ok(usuario);
        }

        [HttpGet]
        public async Task<IActionResult> ListarUsuarios(
            [FromQuery] string? rol,
            [FromQuery] bool? activo,
            [FromQuery] string? busqueda)
        {
            var rolUsuario = User.FindFirst(ClaimTypes.Role)?.Value;

            if (rolUsuario != "Administrador" && rolUsuario != "Jefe DTI")
            {
                return Forbid();
            }

            var query = _context.Usuarios
                .Include(u => u.Rol)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(rol))
            {
                string rolNormalizado = rol.Trim().ToLower();

                query = query.Where(u =>
                    u.Rol != null &&
                    (
                        u.Rol.Nombre.ToLower() == rolNormalizado ||
                        (rolNormalizado == "tecnico" && u.Rol.Nombre == "Técnico") ||
                        (rolNormalizado == "técnico" && u.Rol.Nombre == "Técnico") ||
                        (rolNormalizado == "jefe dti" && u.Rol.Nombre == "Jefe DTI")
                    ));
            }

            if (activo.HasValue)
            {
                query = query.Where(u => u.Activo == activo.Value);
            }

            if (!string.IsNullOrWhiteSpace(busqueda))
            {
                string busquedaNormalizada = busqueda.Trim().ToLower();

                query = query.Where(u =>
                    u.NombreCompleto.ToLower().Contains(busquedaNormalizada) ||
                    u.Correo.ToLower().Contains(busquedaNormalizada));
            }

            var usuarios = await query
                .OrderBy(u => u.NombreCompleto)
                .Select(u => new UsuarioResponseDto
                {
                    Id = u.Id,
                    NombreCompleto = u.NombreCompleto,
                    Correo = u.Correo,
                    Telefono = u.Telefono,
                    Rol = u.Rol != null ? u.Rol.Nombre : "Sin rol",
                    Activo = u.Activo,
                    EmailConfirmado = u.EmailConfirmado,
                    FechaCreacion = u.FechaCreacion
                })
                .ToListAsync();

            return Ok(new
            {
                total = usuarios.Count,
                filtrosAplicados = new { rol, activo, busqueda },
                usuarios
            });
        }

        [HttpPost]
        public async Task<IActionResult> CrearUsuario([FromBody] CrearUsuarioDto dto)
        {
            var rolUsuarioActual = User.FindFirst(ClaimTypes.Role)?.Value;

            if (rolUsuarioActual != "Administrador" && rolUsuarioActual != "Jefe DTI")
            {
                return Forbid();
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(new { mensaje = "Los datos enviados no son válidos.", errores = ModelState });
            }

            string correoNormalizado = dto.Correo.Trim().ToLower();

            bool correoExiste = await _context.Usuarios
                .AnyAsync(u => u.Correo == correoNormalizado);

            if (correoExiste)
            {
                return BadRequest(new { mensaje = "Ya existe un usuario registrado con ese correo." });
            }

            var rol = await _context.Roles
                .FirstOrDefaultAsync(r => r.Id == dto.RolId && r.Activo);

            if (rol == null)
            {
                return BadRequest(new { mensaje = "El rol seleccionado no existe o se encuentra inactivo." });
            }

            if (rolUsuarioActual == "Jefe DTI" && rol.Nombre == "Administrador")
            {
                return Forbid();
            }

            string passwordTemporalInterna = GenerarTokenSeguro();

            var usuario = new Usuario
            {
                NombreCompleto = dto.NombreCompleto.Trim(),
                Correo = correoNormalizado,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(passwordTemporalInterna),
                Telefono = string.IsNullOrWhiteSpace(dto.Telefono) ? null : dto.Telefono.Trim(),
                RolId = rol.Id,
                Activo = true,
                EmailConfirmado = false,
                TokenConfirmacionEmail = GenerarTokenSeguro(),
                FechaExpiracionTokenConfirmacion = DateTime.UtcNow.AddHours(24),
                FechaCreacion = DateTime.UtcNow
            };

            _context.Usuarios.Add(usuario);
            await _context.SaveChangesAsync();

            await EnviarCorreoConfirmacionAsync(usuario);

            var usuarioCreado = await _context.Usuarios
                .Include(u => u.Rol)
                .Where(u => u.Id == usuario.Id)
                .Select(u => new UsuarioResponseDto
                {
                    Id = u.Id,
                    NombreCompleto = u.NombreCompleto,
                    Correo = u.Correo,
                    Telefono = u.Telefono,
                    Rol = u.Rol != null ? u.Rol.Nombre : "Sin rol",
                    Activo = u.Activo,
                    EmailConfirmado = u.EmailConfirmado,
                    FechaCreacion = u.FechaCreacion
                })
                .FirstAsync();

            return CreatedAtAction(nameof(ObtenerPerfil), new { id = usuario.Id }, new
            {
                mensaje = "Usuario creado correctamente. Se envió un correo de activación para que el usuario configure su contraseña.",
                usuario = usuarioCreado
            });
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> ActualizarUsuario(int id, [FromBody] ActualizarUsuarioDto dto)
        {
            var datosUsuario = ObtenerDatosUsuario();

            if (datosUsuario == null)
            {
                return Unauthorized(new { mensaje = "No se pudo identificar al usuario autenticado." });
            }

            if (datosUsuario.Value.RolUsuario != "Administrador" && datosUsuario.Value.RolUsuario != "Jefe DTI")
            {
                return Forbid();
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(new { mensaje = "Los datos enviados no son válidos.", errores = ModelState });
            }

            var usuario = await _context.Usuarios
                .Include(u => u.Rol)
                .FirstOrDefaultAsync(u => u.Id == id);

            if (usuario == null)
            {
                return NotFound(new { mensaje = "Usuario no encontrado." });
            }

            var nuevoRol = await _context.Roles
                .FirstOrDefaultAsync(r => r.Id == dto.RolId && r.Activo);

            if (nuevoRol == null)
            {
                return BadRequest(new { mensaje = "El rol seleccionado no existe o se encuentra inactivo." });
            }

            if (datosUsuario.Value.RolUsuario == "Jefe DTI")
            {
                if (usuario.Rol != null && usuario.Rol.Nombre == "Administrador")
                {
                    return Forbid();
                }

                if (nuevoRol.Nombre == "Administrador")
                {
                    return Forbid();
                }
            }

            if (usuario.Id == datosUsuario.Value.UsuarioId && usuario.RolId != nuevoRol.Id)
            {
                return BadRequest(new { mensaje = "No puede cambiar su propio rol mientras está autenticado." });
            }

            usuario.NombreCompleto = dto.NombreCompleto.Trim();
            usuario.Telefono = string.IsNullOrWhiteSpace(dto.Telefono) ? null : dto.Telefono.Trim();
            usuario.RolId = nuevoRol.Id;
            usuario.FechaActualizacion = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            var usuarioActualizado = await _context.Usuarios
                .Include(u => u.Rol)
                .Where(u => u.Id == usuario.Id)
                .Select(u => new UsuarioResponseDto
                {
                    Id = u.Id,
                    NombreCompleto = u.NombreCompleto,
                    Correo = u.Correo,
                    Telefono = u.Telefono,
                    Rol = u.Rol != null ? u.Rol.Nombre : "Sin rol",
                    Activo = u.Activo,
                    EmailConfirmado = u.EmailConfirmado,
                    FechaCreacion = u.FechaCreacion
                })
                .FirstAsync();

            return Ok(new
            {
                mensaje = "Usuario actualizado correctamente.",
                usuario = usuarioActualizado
            });
        }

        [HttpPut("{id:int}/estado")]
        public async Task<IActionResult> CambiarEstadoUsuario(int id, [FromBody] CambiarEstadoUsuarioDto dto)
        {
            var datosUsuario = ObtenerDatosUsuario();

            if (datosUsuario == null)
            {
                return Unauthorized(new { mensaje = "No se pudo identificar al usuario autenticado." });
            }

            if (datosUsuario.Value.RolUsuario != "Administrador" && datosUsuario.Value.RolUsuario != "Jefe DTI")
            {
                return Forbid();
            }

            var usuario = await _context.Usuarios
                .Include(u => u.Rol)
                .FirstOrDefaultAsync(u => u.Id == id);

            if (usuario == null)
            {
                return NotFound(new { mensaje = "Usuario no encontrado." });
            }

            if (usuario.Id == datosUsuario.Value.UsuarioId && !dto.Activo)
            {
                return BadRequest(new { mensaje = "No puede desactivar su propio usuario." });
            }

            if (datosUsuario.Value.RolUsuario == "Jefe DTI" &&
                usuario.Rol != null &&
                usuario.Rol.Nombre == "Administrador")
            {
                return Forbid();
            }

            if (usuario.Rol != null && usuario.Rol.Nombre == "Administrador" && !dto.Activo)
            {
                int administradoresActivos = await _context.Usuarios
                    .Include(u => u.Rol)
                    .CountAsync(u =>
                        u.Activo &&
                        u.Rol != null &&
                        u.Rol.Nombre == "Administrador");

                if (administradoresActivos <= 1)
                {
                    return BadRequest(new { mensaje = "No se puede desactivar el último administrador activo del sistema." });
                }
            }

            usuario.Activo = dto.Activo;
            usuario.FechaActualizacion = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                mensaje = dto.Activo
                    ? "Usuario activado correctamente."
                    : "Usuario desactivado correctamente.",
                usuario = new
                {
                    usuario.Id,
                    usuario.NombreCompleto,
                    usuario.Correo,
                    Rol = usuario.Rol != null ? usuario.Rol.Nombre : "Sin rol",
                    usuario.Activo,
                    usuario.EmailConfirmado
                }
            });
        }

        [HttpPut("cambiar-password")]
        public async Task<IActionResult> CambiarPasswordPropia([FromBody] CambiarPasswordDto dto)
        {
            var datosUsuario = ObtenerDatosUsuario();

            if (datosUsuario == null)
            {
                return Unauthorized(new { mensaje = "No se pudo identificar al usuario autenticado." });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(new { mensaje = "Los datos enviados no son válidos.", errores = ModelState });
            }

            var usuario = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.Id == datosUsuario.Value.UsuarioId && u.Activo);

            if (usuario == null)
            {
                return NotFound(new { mensaje = "Usuario no encontrado o inactivo." });
            }

            bool passwordActualValida = BCrypt.Net.BCrypt.Verify(dto.PasswordActual, usuario.PasswordHash);

            if (!passwordActualValida)
            {
                return BadRequest(new { mensaje = "La contraseña actual no es correcta." });
            }

            bool nuevaPasswordIgual = BCrypt.Net.BCrypt.Verify(dto.NuevaPassword, usuario.PasswordHash);

            if (nuevaPasswordIgual)
            {
                return BadRequest(new { mensaje = "La nueva contraseña no puede ser igual a la contraseña actual." });
            }

            usuario.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NuevaPassword);
            usuario.FechaActualizacion = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                mensaje = "Contraseña actualizada correctamente."
            });
        }

        [HttpPut("{id:int}/reset-password")]
        public async Task<IActionResult> ResetPassword(int id, [FromBody] ResetPasswordDto dto)
        {
            var rolUsuarioActual = User.FindFirst(ClaimTypes.Role)?.Value;

            if (rolUsuarioActual != "Administrador" && rolUsuarioActual != "Jefe DTI")
            {
                return Forbid();
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(new { mensaje = "Los datos enviados no son válidos.", errores = ModelState });
            }

            var usuario = await _context.Usuarios
                .Include(u => u.Rol)
                .FirstOrDefaultAsync(u => u.Id == id);

            if (usuario == null)
            {
                return NotFound(new { mensaje = "Usuario no encontrado." });
            }

            if (usuario.Rol == null)
            {
                return BadRequest(new { mensaje = "El usuario no tiene un rol válido asignado." });
            }

            if (rolUsuarioActual == "Jefe DTI" && usuario.Rol.Nombre == "Administrador")
            {
                return Forbid();
            }

            if (!usuario.Activo)
            {
                return BadRequest(new { mensaje = "No se puede reiniciar la contraseña de un usuario inactivo." });
            }

            usuario.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NuevaPassword);
            usuario.FechaActualizacion = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                mensaje = "Contraseña reiniciada correctamente.",
                usuario = new
                {
                    usuario.Id,
                    usuario.NombreCompleto,
                    usuario.Correo,
                    Rol = usuario.Rol.Nombre,
                    usuario.Activo,
                    usuario.EmailConfirmado
                }
            });
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

        private async Task EnviarCorreoConfirmacionAsync(Usuario usuario)
        {
            var frontendUrl = _configuration["AppSettings:FrontendUrl"] ?? "http://localhost:3000";

            var enlaceActivacion = $"{frontendUrl}/activar-cuenta?token={Uri.EscapeDataString(usuario.TokenConfirmacionEmail ?? string.Empty)}";

            var contenido = $@"
                <div style=""font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 24px;"">
                    <div style=""max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; border: 1px solid #e5e7eb;"">
                        
                        <div style=""background-color: #0f172a; padding: 20px 24px; color: #ffffff;"">
                            <h2 style=""margin: 0; font-size: 20px;"">Sistema de Incidentes Tecnológicos UTO</h2>
                            <p style=""margin: 6px 0 0; font-size: 14px; color: #cbd5e1;"">
                                Activación de cuenta
                            </p>
                        </div>

                        <div style=""padding: 24px; color: #334155;"">
                            <p style=""font-size: 15px;"">Hola <strong>{usuario.NombreCompleto}</strong>,</p>

                            <p style=""font-size: 15px; line-height: 1.6;"">
                                Se ha creado una cuenta para usted en el Sistema Web de Gestión de Incidentes Tecnológicos UTO.
                            </p>

                            <p style=""font-size: 15px; line-height: 1.6;"">
                                Para activar su cuenta y crear su contraseña personal, presione el siguiente botón:
                            </p>

                            <div style=""text-align: center; margin: 28px 0;"">
                                <a href=""{enlaceActivacion}""
                                   style=""background-color: #2563eb; color: #ffffff; padding: 12px 22px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;"">
                                    Activar cuenta
                                </a>
                            </div>

                            <p style=""font-size: 14px; line-height: 1.6; color: #64748b;"">
                                Este enlace vencerá en 24 horas. Si usted no reconoce esta acción, puede ignorar este mensaje.
                            </p>
                        </div>

                        <div style=""background-color: #f8fafc; padding: 14px 24px; border-top: 1px solid #e5e7eb;"">
                            <p style=""margin: 0; font-size: 12px; color: #64748b; text-align: center;"">
                                UTO-01 · Gestión de Incidentes Tecnológicos
                            </p>
                        </div>
                    </div>
                </div>
            ";

            await _emailService.EnviarCorreoAsync(
                usuario.Correo,
                "Activación de cuenta - Sistema de Incidentes UTO",
                contenido
            );
        }

        private static string GenerarTokenSeguro()
        {
            return Convert.ToBase64String(RandomNumberGenerator.GetBytes(64))
                .Replace("+", "-")
                .Replace("/", "_")
                .Replace("=", "");
        }
    }
}