var builder = WebApplication.CreateBuilder(args);

// Servicios base de la API
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

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
    mensaje = "API del Sistema Web de Gestión de Incidentes Tecnológicos funcionando correctamente",
    estado = "Activo",
    version = "1.0.0",
    enfoque = "Seguridad, buenas prácticas, trazabilidad e ITIL"
});

// Middleware base
app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();