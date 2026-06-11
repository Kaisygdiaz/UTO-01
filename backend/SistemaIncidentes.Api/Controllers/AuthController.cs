using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using SistemaIncidentes.Api.Data;
using SistemaIncidentes.Api.DTOs;
using SistemaIncidentes.Api.Models;
using SistemaIncidentes.Api.Services;

namespace SistemaIncidentes.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly IEmailService _emailService;

        public AuthController(
            ApplicationDbContext context,
            IConfiguration configuration,
            IEmailService emailService)
        {
            _context = context;
            _configuration = configuration;
            _emailService = emailService;
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
                EmailConfirmado = true,
                FechaConfirmacionEmail = DateTime.UtcNow,
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
                    Rol = rolAdmin.Nombre,
                    usuario.EmailConfirmado
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

            if (!usuario.EmailConfirmado)
            {
                return Unauthorized(new
                {
                    mensaje = "Debe confirmar su correo electrónico antes de iniciar sesión."
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

        [HttpGet("confirmar-email")]
        public async Task<IActionResult> ConfirmarEmail([FromQuery] string token)
        {
            if (string.IsNullOrWhiteSpace(token))
            {
                return BadRequest(new
                {
                    mensaje = "El token de confirmación es requerido."
                });
            }

            var usuario = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.TokenConfirmacionEmail == token);

            if (usuario == null)
            {
                return BadRequest(new
                {
                    mensaje = "El token de confirmación no es válido."
                });
            }

            if (usuario.EmailConfirmado)
            {
                return Ok(new
                {
                    mensaje = "El correo ya se encontraba confirmado."
                });
            }

            if (usuario.FechaExpiracionTokenConfirmacion.HasValue &&
                usuario.FechaExpiracionTokenConfirmacion.Value < DateTime.UtcNow)
            {
                return BadRequest(new
                {
                    mensaje = "El token de confirmación ha expirado. Solicite un nuevo enlace de confirmación."
                });
            }

            usuario.EmailConfirmado = true;
            usuario.TokenConfirmacionEmail = null;
            usuario.FechaExpiracionTokenConfirmacion = null;
            usuario.FechaConfirmacionEmail = DateTime.UtcNow;
            usuario.FechaActualizacion = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                mensaje = "Correo electrónico confirmado correctamente. Ya puede iniciar sesión."
            });
        }

        [HttpPost("reenviar-confirmacion")]
        public async Task<IActionResult> ReenviarConfirmacion([FromBody] LoginDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new
                {
                    mensaje = "Los datos enviados no son válidos.",
                    errores = ModelState
                });
            }

            var correoNormalizado = dto.Correo.Trim().ToLower();

            var usuario = await _context.Usuarios
                .Include(u => u.Rol)
                .FirstOrDefaultAsync(u => u.Correo == correoNormalizado);

            if (usuario == null)
            {
                return NotFound(new
                {
                    mensaje = "No se encontró un usuario registrado con ese correo."
                });
            }

            if (!usuario.Activo)
            {
                return BadRequest(new
                {
                    mensaje = "El usuario se encuentra inactivo."
                });
            }

            if (usuario.EmailConfirmado)
            {
                return BadRequest(new
                {
                    mensaje = "El correo electrónico ya se encuentra confirmado."
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

            usuario.TokenConfirmacionEmail = GenerarTokenSeguro();
            usuario.FechaExpiracionTokenConfirmacion = DateTime.UtcNow.AddHours(24);
            usuario.FechaActualizacion = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            await EnviarCorreoConfirmacionAsync(usuario);

            return Ok(new
            {
                mensaje = "Se envió un nuevo correo de confirmación."
            });
        }

        [HttpPost("solicitar-reset-password")]
        public async Task<IActionResult> SolicitarResetPassword([FromBody] SolicitarResetPasswordDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new
                {
                    mensaje = "Los datos enviados no son válidos.",
                    errores = ModelState
                });
            }

            var correoNormalizado = dto.Correo.Trim().ToLower();

            var usuario = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.Correo == correoNormalizado);

            var respuestaGenerica = new
            {
                mensaje = "Si el correo existe y está habilitado, se enviará un enlace para restablecer la contraseña."
            };

            if (usuario == null || !usuario.Activo || !usuario.EmailConfirmado)
            {
                return Ok(respuestaGenerica);
            }

            usuario.TokenResetPassword = GenerarTokenSeguro();
            usuario.FechaExpiracionTokenResetPassword = DateTime.UtcNow.AddHours(1);
            usuario.FechaActualizacion = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            await EnviarCorreoResetPasswordAsync(usuario);

            return Ok(respuestaGenerica);
        }

        [HttpPost("confirmar-reset-password")]
        public async Task<IActionResult> ConfirmarResetPassword([FromBody] ConfirmarResetPasswordDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new
                {
                    mensaje = "Los datos enviados no son válidos.",
                    errores = ModelState
                });
            }

            if (string.IsNullOrWhiteSpace(dto.Token))
            {
                return BadRequest(new
                {
                    mensaje = "El token de recuperación es requerido."
                });
            }

            var usuario = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.TokenResetPassword == dto.Token);

            if (usuario == null)
            {
                return BadRequest(new
                {
                    mensaje = "El token de recuperación no es válido."
                });
            }

            if (!usuario.Activo)
            {
                return BadRequest(new
                {
                    mensaje = "El usuario se encuentra inactivo."
                });
            }

            if (usuario.FechaExpiracionTokenResetPassword.HasValue &&
                usuario.FechaExpiracionTokenResetPassword.Value < DateTime.UtcNow)
            {
                return BadRequest(new
                {
                    mensaje = "El token de recuperación ha expirado. Solicite un nuevo enlace."
                });
            }

            bool mismaPassword = BCrypt.Net.BCrypt.Verify(dto.NuevaPassword, usuario.PasswordHash);

            if (mismaPassword)
            {
                return BadRequest(new
                {
                    mensaje = "La nueva contraseña no puede ser igual a la contraseña actual."
                });
            }

            usuario.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NuevaPassword);
            usuario.TokenResetPassword = null;
            usuario.FechaExpiracionTokenResetPassword = null;
            usuario.FechaActualizacion = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                mensaje = "Contraseña restablecida correctamente. Ya puede iniciar sesión."
            });
        }

        private async Task EnviarCorreoConfirmacionAsync(Usuario usuario)
        {
            var apiBaseUrl = _configuration["AppSettings:ApiBaseUrl"] ?? "http://localhost:5014";
            var enlaceConfirmacion = $"{apiBaseUrl}/api/Auth/confirmar-email?token={Uri.EscapeDataString(usuario.TokenConfirmacionEmail ?? string.Empty)}";

            var contenido = $@"
                <h2>Confirmación de correo electrónico</h2>
                <p>Hola {EscaparHtml(usuario.NombreCompleto)},</p>
                <p>Se ha creado una cuenta para usted en el Sistema de Gestión de Incidentes Tecnológicos UTO.</p>
                <p>Para activar su acceso, confirme su correo electrónico desde el siguiente enlace:</p>
                <p><a href=""{enlaceConfirmacion}"">Confirmar correo electrónico</a></p>
                <p>Este enlace vencerá en 24 horas.</p>
                <p>Si usted no solicitó esta cuenta, puede ignorar este mensaje.</p>
            ";

            await _emailService.EnviarCorreoAsync(
                usuario.Correo,
                "Confirmación de correo - Sistema de Incidentes UTO",
                contenido
            );
        }

        private async Task EnviarCorreoResetPasswordAsync(Usuario usuario)
        {
            var frontendUrl = _configuration["AppSettings:FrontendUrl"] ?? "http://localhost:3000";
            var enlaceReset = $"{frontendUrl}/reset-password?token={Uri.EscapeDataString(usuario.TokenResetPassword ?? string.Empty)}";

            var contenido = $@"
                <h2>Restablecimiento de contraseña</h2>
                <p>Hola {EscaparHtml(usuario.NombreCompleto)},</p>
                <p>Se recibió una solicitud para restablecer la contraseña de su cuenta en el Sistema de Gestión de Incidentes Tecnológicos UTO.</p>
                <p>Para crear una nueva contraseña, utilice el siguiente enlace:</p>
                <p><a href=""{enlaceReset}"">Restablecer contraseña</a></p>
                <p>Este enlace vencerá en 1 hora.</p>
                <p>Si usted no solicitó este cambio, puede ignorar este mensaje. Su contraseña actual seguirá siendo válida.</p>
            ";

            await _emailService.EnviarCorreoAsync(
                usuario.Correo,
                "Restablecimiento de contraseña - Sistema de Incidentes UTO",
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

        private static string EscaparHtml(string valor)
        {
            return System.Net.WebUtility.HtmlEncode(valor);
        }
    }
}