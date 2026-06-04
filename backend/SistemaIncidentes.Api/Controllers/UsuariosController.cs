using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaIncidentes.Api.Data;

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
                .Select(u => new
                {
                    u.Id,
                    u.NombreCompleto,
                    u.Correo,
                    u.Telefono,
                    Rol = u.Rol != null ? u.Rol.Nombre : "Sin rol",
                    u.FechaCreacion
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
    }
}