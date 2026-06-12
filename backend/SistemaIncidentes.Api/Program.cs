using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using SistemaIncidentes.Api.Data;
using SistemaIncidentes.Api.Models;
using SistemaIncidentes.Api.Seeders;
using SistemaIncidentes.Api.Services;
using SistemaIncidentes.Api.Settings;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

builder.Services.Configure<EmailSettings>(builder.Configuration.GetSection("EmailSettings"));
builder.Services.AddScoped<IEmailService, EmailService>();

// Servicio de comentarios de tickets
builder.Services.AddScoped<ITicketComentarioService, TicketComentarioService>();

builder.Services.Configure<SlaSettings>(builder.Configuration.GetSection("SlaSettings"));
builder.Services.AddHostedService<SlaNotificationBackgroundService>();

var frontendUrl = builder.Configuration["AppSettings:FrontendUrl"] ?? "http://localhost:3000";

builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
    {
        policy
            .WithOrigins(frontendUrl)
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Sistema de Gestión de Incidentes Tecnológicos API",
        Version = "v1",
        Description = "API para la gestión de incidentes tecnológicos con autenticación, roles, SLA y trazabilidad."
    });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Ingrese el token JWT con el formato: Bearer {token}",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                },
                Scheme = "Bearer",
                Name = "Bearer",
                In = ParameterLocation.Header
            },
            new List<string>()
        }
    });
});

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

var jwtKey = builder.Configuration["JwtSettings:Key"];
var jwtIssuer = builder.Configuration["JwtSettings:Issuer"];
var jwtAudience = builder.Configuration["JwtSettings:Audience"];

if (string.IsNullOrWhiteSpace(jwtKey))
{
    throw new InvalidOperationException("La clave JWT no está configurada.");
}

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;

    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        ClockSkew = TimeSpan.Zero
    };
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    await DataSeeder.SeedAsync(context);
    await SeedConfiguracionAdministrableAsync(context);
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapGet("/", () => new
{
    nombre = "Sistema Web de Gestión de Incidentes Tecnológicos",
    estado = "API activa",
    version = "1.0.0",
    entorno = app.Environment.EnvironmentName
});

app.UseHttpsRedirection();
app.UseCors("FrontendPolicy");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();

static async Task SeedConfiguracionAdministrableAsync(ApplicationDbContext context)
{
    if (!await context.ConfiguracionesSla.AnyAsync())
    {
        context.ConfiguracionesSla.Add(new ConfiguracionSla
        {
            Habilitado = true,
            IntervaloRevisionMinutos = 1,
            PorcentajeProximoVencimiento = 25,
            FechaCreacion = DateTime.UtcNow
        });
    }

    if (!await context.MatrizPrioridades.AnyAsync())
    {
        var prioridades = await context.Prioridades.ToListAsync();

        int ObtenerPrioridadId(string nombre)
        {
            var prioridad = prioridades.FirstOrDefault(p => p.Nombre == nombre);

            if (prioridad == null)
            {
                throw new InvalidOperationException($"No se encontró la prioridad base '{nombre}'. Verifique el seeder de prioridades.");
            }

            return prioridad.Id;
        }

        var matriz = new List<MatrizPrioridad>
        {
            new MatrizPrioridad { Impacto = "Alto", Urgencia = "Alta", PrioridadId = ObtenerPrioridadId("Critica"), FechaCreacion = DateTime.UtcNow },
            new MatrizPrioridad { Impacto = "Alto", Urgencia = "Media", PrioridadId = ObtenerPrioridadId("Alta"), FechaCreacion = DateTime.UtcNow },
            new MatrizPrioridad { Impacto = "Alto", Urgencia = "Baja", PrioridadId = ObtenerPrioridadId("Media"), FechaCreacion = DateTime.UtcNow },
            new MatrizPrioridad { Impacto = "Medio", Urgencia = "Alta", PrioridadId = ObtenerPrioridadId("Alta"), FechaCreacion = DateTime.UtcNow },
            new MatrizPrioridad { Impacto = "Medio", Urgencia = "Media", PrioridadId = ObtenerPrioridadId("Media"), FechaCreacion = DateTime.UtcNow },
            new MatrizPrioridad { Impacto = "Medio", Urgencia = "Baja", PrioridadId = ObtenerPrioridadId("Baja"), FechaCreacion = DateTime.UtcNow },
            new MatrizPrioridad { Impacto = "Bajo", Urgencia = "Alta", PrioridadId = ObtenerPrioridadId("Media"), FechaCreacion = DateTime.UtcNow },
            new MatrizPrioridad { Impacto = "Bajo", Urgencia = "Media", PrioridadId = ObtenerPrioridadId("Baja"), FechaCreacion = DateTime.UtcNow },
            new MatrizPrioridad { Impacto = "Bajo", Urgencia = "Baja", PrioridadId = ObtenerPrioridadId("Baja"), FechaCreacion = DateTime.UtcNow }
        };

        context.MatrizPrioridades.AddRange(matriz);
    }

    await context.SaveChangesAsync();
}