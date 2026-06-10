using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaIncidentes.Api.Data;
using SistemaIncidentes.Api.DTOs;

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
        public async Task<IActionResult> ObtenerCategorias()
        {
            var categorias = await _context.Categorias
                .Where(c => c.Activo)
                .OrderBy(c => c.Nombre)
                .Select(c => new CatalogoResponseDto
                {
                    Id = c.Id,
                    Nombre = c.Nombre,
                    Descripcion = c.Descripcion
                })
                .ToListAsync();

            return Ok(categorias);
        }

        [HttpGet("prioridades")]
        public async Task<IActionResult> ObtenerPrioridades()
        {
            var prioridades = await _context.Prioridades
                .Where(p => p.Activo)
                .OrderBy(p => p.Id)
                .Select(p => new CatalogoResponseDto
                {
                    Id = p.Id,
                    Nombre = p.Nombre,
                    Descripcion = p.Descripcion
                })
                .ToListAsync();

            return Ok(prioridades);
        }

        [HttpGet("estados-ticket")]
        public async Task<IActionResult> ObtenerEstadosTicket()
        {
            var estados = await _context.EstadosTicket
                .Where(e => e.Activo)
                .OrderBy(e => e.Id)
                .Select(e => new CatalogoResponseDto
                {
                    Id = e.Id,
                    Nombre = e.Nombre,
                    Descripcion = e.Descripcion
                })
                .ToListAsync();

            return Ok(estados);
        }

        [HttpGet("tecnicos")]
        public async Task<IActionResult> ObtenerTecnicos()
        {
            var tecnicos = await _context.Usuarios
                .Include(u => u.Rol)
                .Where(u =>
                    u.Activo &&
                    u.Rol != null &&
                    u.Rol.Nombre == "Técnico")
                .OrderBy(u => u.NombreCompleto)
                .Select(u => new TecnicoResponseDto
                {
                    Id = u.Id,
                    NombreCompleto = u.NombreCompleto,
                    Correo = u.Correo
                })
                .ToListAsync();

            return Ok(tecnicos);
        }
    }
}