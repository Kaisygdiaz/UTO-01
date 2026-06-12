using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Authorization;
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
        [AllowAnonymous]
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
        [AllowAnonymous]
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

            var correoNormalizado = dto.Correo.Trim().ToLower();

            var usuario = await _context.Usuarios
                .Include(u => u.Rol)
                .FirstOrDefaultAsync(u => u.Correo == correoNormalizado);

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
                    mensaje = "Debe activar su cuenta desde el enlace enviado al correo electrónico."
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

        [HttpPost("activar-cuenta")]
        [AllowAnonymous]
        public async Task<IActionResult> ActivarCuenta([FromBody] ActivarCuentaDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new
                {
                    mensaje = "Los datos enviados no son válidos.",
                    errores = ModelState
                });
            }

            var token = dto.Token.Trim();

            var usuario = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.TokenConfirmacionEmail == token);

            if (usuario == null)
            {
                return BadRequest(new
                {
                    mensaje = "El enlace de activación no es válido."
                });
            }

            if (!usuario.Activo)
            {
                return BadRequest(new
                {
                    mensaje = "No se puede activar la cuenta porque el usuario está inactivo."
                });
            }

            if (usuario.FechaExpiracionTokenConfirmacion.HasValue &&
                usuario.FechaExpiracionTokenConfirmacion.Value < DateTime.UtcNow)
            {
                return BadRequest(new
                {
                    mensaje = "El enlace de activación ha vencido. Solicite un nuevo enlace."
                });
            }

            usuario.EmailConfirmado = true;
            usuario.FechaConfirmacionEmail = DateTime.UtcNow;
            usuario.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NuevaPassword);
            usuario.TokenConfirmacionEmail = null;
            usuario.FechaExpiracionTokenConfirmacion = null;
            usuario.FechaActualizacion = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                mensaje = "Cuenta activada correctamente. Ya puede iniciar sesión."
            });
        }

        [HttpGet("confirmar-email")]
        [AllowAnonymous]
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
        [AllowAnonymous]
        public async Task<IActionResult> ReenviarConfirmacion([FromBody] SolicitarResetPasswordDto dto)
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
                    mensaje = "La cuenta ya se encuentra activada."
                });
            }

            usuario.TokenConfirmacionEmail = GenerarTokenSeguro();
            usuario.FechaExpiracionTokenConfirmacion = DateTime.UtcNow.AddHours(24);
            usuario.FechaActualizacion = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            await EnviarCorreoConfirmacionAsync(usuario);

            return Ok(new
            {
                mensaje = "Se reenvió el correo de activación correctamente."
            });
        }

        [HttpPost("solicitar-reset-password")]
        [AllowAnonymous]
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
                .FirstOrDefaultAsync(u => u.Correo == correoNormalizado && u.Activo);

            if (usuario == null)
            {
                return Ok(new
                {
                    mensaje = "Si el correo existe y está activo, se enviará un enlace de restablecimiento."
                });
            }

            usuario.TokenResetPassword = GenerarTokenSeguro();
            usuario.FechaExpiracionTokenResetPassword = DateTime.UtcNow.AddHours(1);
            usuario.FechaActualizacion = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            await EnviarCorreoResetPasswordAsync(usuario);

            return Ok(new
            {
                mensaje = "Se envió un enlace de restablecimiento al correo electrónico."
            });
        }

        [HttpPost("confirmar-reset-password")]
        [AllowAnonymous]
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

            var token = dto.Token.Trim();

            var usuario = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.TokenResetPassword == token && u.Activo);

            if (usuario == null)
            {
                return BadRequest(new
                {
                    mensaje = "El enlace de restablecimiento no es válido."
                });
            }

            if (usuario.FechaExpiracionTokenResetPassword.HasValue &&
                usuario.FechaExpiracionTokenResetPassword.Value < DateTime.UtcNow)
            {
                return BadRequest(new
                {
                    mensaje = "El enlace de restablecimiento ha vencido. Solicite uno nuevo."
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

        private async Task EnviarCorreoResetPasswordAsync(Usuario usuario)
        {
            var frontendUrl = _configuration["AppSettings:FrontendUrl"] ?? "http://localhost:3000";

            var enlaceReset = $"{frontendUrl}/reset-password?token={Uri.EscapeDataString(usuario.TokenResetPassword ?? string.Empty)}";

            var contenido = $@"
                <div style=""font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 24px;"">
                    <div style=""max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; border: 1px solid #e5e7eb;"">
                        
                        <div style=""background-color: #0f172a; padding: 20px 24px; color: #ffffff;"">
                            <h2 style=""margin: 0; font-size: 20px;"">Sistema de Incidentes Tecnológicos UTO</h2>
                            <p style=""margin: 6px 0 0; font-size: 14px; color: #cbd5e1;"">
                                Restablecimiento de contraseña
                            </p>
                        </div>

                        <div style=""padding: 24px; color: #334155;"">
                            <p style=""font-size: 15px;"">Hola <strong>{usuario.NombreCompleto}</strong>,</p>

                            <p style=""font-size: 15px; line-height: 1.6;"">
                                Se solicitó el restablecimiento de contraseña para su cuenta.
                            </p>

                            <p style=""font-size: 15px; line-height: 1.6;"">
                                Para crear una nueva contraseña, presione el siguiente botón:
                            </p>

                            <div style=""text-align: center; margin: 28px 0;"">
                                <a href=""{enlaceReset}""
                                   style=""background-color: #d97706; color: #ffffff; padding: 12px 22px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;"">
                                    Restablecer contraseña
                                </a>
                            </div>

                            <p style=""font-size: 14px; line-height: 1.6; color: #64748b;"">
                                Este enlace vencerá en 1 hora. Si usted no solicitó esta acción, puede ignorar este mensaje.
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
    }
}