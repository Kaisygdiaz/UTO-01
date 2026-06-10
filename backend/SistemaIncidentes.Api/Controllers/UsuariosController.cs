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
    public class UsuariosController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public UsuariosController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("perfil")]
        public async Task<IActionResult> ObtenerPerfil()
        {
            var usuarioIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrWhiteSpace(usuarioIdClaim))
            {
                return Unauthorized(new
                {
                    mensaje = "No se pudo identificar al usuario autenticado."
                });
            }

            if (!int.TryParse(usuarioIdClaim, out int usuarioId))
            {
                return Unauthorized(new
                {
                    mensaje = "El identificador del usuario no es válido."
                });
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
                    FechaCreacion = u.FechaCreacion
                })
                .FirstOrDefaultAsync();

            if (usuario == null)
            {
                return NotFound(new
                {
                    mensaje = "Usuario no encontrado o inactivo."
                });
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
                    FechaCreacion = u.FechaCreacion
                })
                .ToListAsync();

            return Ok(new
            {
                total = usuarios.Count,
                filtrosAplicados = new
                {
                    rol,
                    activo,
                    busqueda
                },
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
                return BadRequest(new
                {
                    mensaje = "Los datos enviados no son válidos.",
                    errores = ModelState
                });
            }

            string correoNormalizado = dto.Correo.Trim().ToLower();

            bool correoExiste = await _context.Usuarios
                .AnyAsync(u => u.Correo == correoNormalizado);

            if (correoExiste)
            {
                return BadRequest(new
                {
                    mensaje = "Ya existe un usuario registrado con ese correo."
                });
            }

            var rol = await _context.Roles
                .FirstOrDefaultAsync(r => r.Id == dto.RolId && r.Activo);

            if (rol == null)
            {
                return BadRequest(new
                {
                    mensaje = "El rol seleccionado no existe o se encuentra inactivo."
                });
            }

            if (rolUsuarioActual == "Jefe DTI" && rol.Nombre == "Administrador")
            {
                return Forbid();
            }

            var usuario = new Usuario
            {
                NombreCompleto = dto.NombreCompleto.Trim(),
                Correo = correoNormalizado,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Telefono = string.IsNullOrWhiteSpace(dto.Telefono) ? null : dto.Telefono.Trim(),
                RolId = rol.Id,
                Activo = true,
                FechaCreacion = DateTime.UtcNow
            };

            _context.Usuarios.Add(usuario);
            await _context.SaveChangesAsync();

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
                    FechaCreacion = u.FechaCreacion
                })
                .FirstAsync();

            return CreatedAtAction(nameof(ObtenerPerfil), new { id = usuario.Id }, usuarioCreado);
        }
    }
}