using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using SistemaIncidentes.Api.Data;
using SistemaIncidentes.Api.DTOs;
using SistemaIncidentes.Api.Models;

namespace SistemaIncidentes.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("registro-inicial")]
        public async Task<IActionResult> RegistroInicial([FromBody] RegistroInicialDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new
                {
                    mensaje = "Los datos enviados no son válidos.",
                    errores = ModelState
                });
            }

            bool existenUsuarios = await _context.Usuarios.AnyAsync();

            if (existenUsuarios)
            {
                return BadRequest(new
                {
                    mensaje = "El registro inicial ya fue realizado."
                });
            }

            var rolAdmin = await _context.Roles.FirstOrDefaultAsync(r => r.Nombre == "Administrador");

            if (rolAdmin == null)
            {
                rolAdmin = new Rol
                {
                    Nombre = "Administrador",
                    Descripcion = "Usuario con acceso completo al sistema."
                };

                _context.Roles.Add(rolAdmin);
                await _context.SaveChangesAsync();
            }

            var usuario = new Usuario
            {
                NombreCompleto = dto.NombreCompleto.Trim(),
                Correo = dto.Correo.Trim().ToLower(),
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Telefono = dto.Telefono,
                RolId = rolAdmin.Id,
                Activo = true,
                FechaCreacion = DateTime.UtcNow
            };

            _context.Usuarios.Add(usuario);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                mensaje = "Usuario administrador inicial creado correctamente.",
                usuario = new
                {
                    usuario.Id,
                    usuario.NombreCompleto,
                    usuario.Correo,
                    Rol = rolAdmin.Nombre
                }
            });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new
                {
                    mensaje = "Los datos enviados no son válidos.",
                    errores = ModelState
                });
            }

            var usuario = await _context.Usuarios
                .Include(u => u.Rol)
                .FirstOrDefaultAsync(u => u.Correo == dto.Correo.Trim().ToLower());

            if (usuario == null)
            {
                return Unauthorized(new
                {
                    mensaje = "Credenciales inválidas."
                });
            }

            if (!usuario.Activo)
            {
                return Unauthorized(new
                {
                    mensaje = "El usuario se encuentra inactivo."
                });
            }

            bool passwordValido = BCrypt.Net.BCrypt.Verify(dto.Password, usuario.PasswordHash);

            if (!passwordValido)
            {
                return Unauthorized(new
                {
                    mensaje = "Credenciales inválidas."
                });
            }

            var token = GenerarToken(usuario);

            return Ok(token);
        }

        private AuthResponseDto GenerarToken(Usuario usuario)
        {
            var jwtKey = _configuration["JwtSettings:Key"];
            var issuer = _configuration["JwtSettings:Issuer"];
            var audience = _configuration["JwtSettings:Audience"];
            var durationInMinutes = Convert.ToInt32(_configuration["JwtSettings:DurationInMinutes"]);

            if (string.IsNullOrWhiteSpace(jwtKey))
            {
                throw new InvalidOperationException("La clave JWT no está configurada.");
            }

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, usuario.Id.ToString()),
                new Claim(ClaimTypes.Name, usuario.NombreCompleto),
                new Claim(ClaimTypes.Email, usuario.Correo),
                new Claim(ClaimTypes.Role, usuario.Rol?.Nombre ?? "SinRol")
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var expiration = DateTime.UtcNow.AddMinutes(durationInMinutes);

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: expiration,
                signingCredentials: credentials
            );

            return new AuthResponseDto
            {
                Token = new JwtSecurityTokenHandler().WriteToken(token),
                ExpiraEn = expiration,
                Usuario = new UsuarioAuthDto
                {
                    Id = usuario.Id,
                    NombreCompleto = usuario.NombreCompleto,
                    Correo = usuario.Correo,
                    Rol = usuario.Rol?.Nombre ?? "SinRol"
                }
            };
        }
    }
}