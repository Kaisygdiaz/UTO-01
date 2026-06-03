using Microsoft.EntityFrameworkCore;
using SistemaIncidentes.Api.Data;

var builder = WebApplication.CreateBuilder(args);

// Servicios base de la API
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Conexión a PostgreSQL con Entity Framework Core
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

var app = builder.Build();

// Swagger solo en ambiente de desarrollo
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Ruta inicial de verificación
app.MapGet("/", () => new
{
    nombre = "Sistema Web de Gestión de Incidentes Tecnológicos",
    estado = "API activa",
    version = "1.0.0",
    entorno = app.Environment.EnvironmentName
});

// Middleware base
app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();