using Microsoft.EntityFrameworkCore;
using SistemaIncidentes.Api.Models;

namespace SistemaIncidentes.Api.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Rol> Roles => Set<Rol>();
        public DbSet<Usuario> Usuarios => Set<Usuario>();
        public DbSet<Categoria> Categorias => Set<Categoria>();
        public DbSet<EstadoTicket> EstadosTicket => Set<EstadoTicket>();
        public DbSet<Prioridad> Prioridades => Set<Prioridad>();
        public DbSet<Ticket> Tickets => Set<Ticket>();
        public DbSet<BitacoraAuditoria> BitacoraAuditoria => Set<BitacoraAuditoria>();
        public DbSet<ComentarioTicket> ComentariosTicket => Set<ComentarioTicket>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Rol>(entity =>
            {
                entity.ToTable("roles");

                entity.HasKey(r => r.Id);

                entity.Property(r => r.Id)
                    .HasColumnName("id");

                entity.Property(r => r.Nombre)
                    .HasColumnName("nombre")
                    .HasMaxLength(50)
                    .IsRequired();

                entity.HasIndex(r => r.Nombre)
                    .IsUnique();

                entity.Property(r => r.Descripcion)
                    .HasColumnName("descripcion")
                    .HasMaxLength(200);

                entity.Property(r => r.Activo)
                    .HasColumnName("activo")
                    .HasDefaultValue(true);

                entity.Property(r => r.FechaCreacion)
                    .HasColumnName("fecha_creacion")
                    .HasDefaultValueSql("CURRENT_TIMESTAMP");
            });

            modelBuilder.Entity<Usuario>(entity =>
            {
                entity.ToTable("usuarios");

                entity.HasKey(u => u.Id);

                entity.Property(u => u.Id)
                    .HasColumnName("id");

                entity.Property(u => u.NombreCompleto)
                    .HasColumnName("nombre_completo")
                    .HasMaxLength(100)
                    .IsRequired();

                entity.Property(u => u.Correo)
                    .HasColumnName("correo")
                    .HasMaxLength(120)
                    .IsRequired();

                entity.HasIndex(u => u.Correo)
                    .IsUnique();

                entity.Property(u => u.PasswordHash)
                    .HasColumnName("password_hash")
                    .IsRequired();

                entity.Property(u => u.Telefono)
                    .HasColumnName("telefono")
                    .HasMaxLength(20);

                entity.Property(u => u.Activo)
                    .HasColumnName("activo")
                    .HasDefaultValue(true);

                entity.Property(u => u.FechaCreacion)
                    .HasColumnName("fecha_creacion")
                    .HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.Property(u => u.FechaActualizacion)
                    .HasColumnName("fecha_actualizacion");

                entity.Property(u => u.RolId)
                    .HasColumnName("rol_id")
                    .IsRequired();

                entity.HasOne(u => u.Rol)
                    .WithMany(r => r.Usuarios)
                    .HasForeignKey(u => u.RolId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<Categoria>(entity =>
            {
                entity.ToTable("categorias");

                entity.HasKey(c => c.Id);

                entity.Property(c => c.Id)
                    .HasColumnName("id");

                entity.Property(c => c.Nombre)
                    .HasColumnName("nombre")
                    .HasMaxLength(80)
                    .IsRequired();

                entity.HasIndex(c => c.Nombre)
                    .IsUnique();

                entity.Property(c => c.Descripcion)
                    .HasColumnName("descripcion")
                    .HasMaxLength(250);

                entity.Property(c => c.Activo)
                    .HasColumnName("activo")
                    .HasDefaultValue(true);

                entity.Property(c => c.FechaCreacion)
                    .HasColumnName("fecha_creacion")
                    .HasDefaultValueSql("CURRENT_TIMESTAMP");
            });

            modelBuilder.Entity<EstadoTicket>(entity =>
            {
                entity.ToTable("estados_ticket");

                entity.HasKey(e => e.Id);

                entity.Property(e => e.Id)
                    .HasColumnName("id");

                entity.Property(e => e.Nombre)
                    .HasColumnName("nombre")
                    .HasMaxLength(50)
                    .IsRequired();

                entity.HasIndex(e => e.Nombre)
                    .IsUnique();

                entity.Property(e => e.Descripcion)
                    .HasColumnName("descripcion")
                    .HasMaxLength(200);

                entity.Property(e => e.Activo)
                    .HasColumnName("activo")
                    .HasDefaultValue(true);
            });

            modelBuilder.Entity<Prioridad>(entity =>
            {
                entity.ToTable("prioridades");

                entity.HasKey(p => p.Id);

                entity.Property(p => p.Id)
                    .HasColumnName("id");

                entity.Property(p => p.Nombre)
                    .HasColumnName("nombre")
                    .HasMaxLength(50)
                    .IsRequired();

                entity.HasIndex(p => p.Nombre)
                    .IsUnique();

                entity.Property(p => p.Descripcion)
                    .HasColumnName("descripcion")
                    .HasMaxLength(200);

                entity.Property(p => p.TiempoRespuestaHoras)
                    .HasColumnName("tiempo_respuesta_horas")
                    .IsRequired();

                entity.Property(p => p.TiempoResolucionHoras)
                    .HasColumnName("tiempo_resolucion_horas")
                    .IsRequired();

                entity.Property(p => p.Activo)
                    .HasColumnName("activo")
                    .HasDefaultValue(true);
            });

            modelBuilder.Entity<Ticket>(entity =>
            {
                entity.ToTable("tickets");

                entity.HasKey(t => t.Id);

                entity.Property(t => t.Id)
                    .HasColumnName("id");

                entity.Property(t => t.Titulo)
                    .HasColumnName("titulo")
                    .HasMaxLength(150)
                    .IsRequired();

                entity.Property(t => t.Descripcion)
                    .HasColumnName("descripcion")
                    .HasMaxLength(1000)
                    .IsRequired();

                entity.Property(t => t.Solucion)
                    .HasColumnName("solucion")
                    .HasMaxLength(1000);

                entity.Property(t => t.ComentarioCierre)
                    .HasColumnName("comentario_cierre")
                    .HasMaxLength(1000);

                entity.Property(t => t.CalificacionSatisfaccion)
                    .HasColumnName("calificacion_satisfaccion");

                entity.Property(t => t.Impacto)
                    .HasColumnName("impacto")
                    .HasMaxLength(20)
                    .IsRequired();

                entity.Property(t => t.Urgencia)
                    .HasColumnName("urgencia")
                    .HasMaxLength(20)
                    .IsRequired();

                entity.Property(t => t.FechaCreacion)
                    .HasColumnName("fecha_creacion")
                    .HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.Property(t => t.FechaPrimeraRespuesta)
                    .HasColumnName("fecha_primera_respuesta");

                entity.Property(t => t.FechaResolucion)
                    .HasColumnName("fecha_resolucion");

                entity.Property(t => t.FechaCierre)
                    .HasColumnName("fecha_cierre");

                entity.Property(t => t.UsuarioSolicitanteId)
                    .HasColumnName("usuario_solicitante_id")
                    .IsRequired();

                entity.Property(t => t.TecnicoAsignadoId)
                    .HasColumnName("tecnico_asignado_id");

                entity.Property(t => t.CategoriaId)
                    .HasColumnName("categoria_id")
                    .IsRequired();

                entity.Property(t => t.EstadoTicketId)
                    .HasColumnName("estado_ticket_id")
                    .IsRequired();

                entity.Property(t => t.PrioridadId)
                    .HasColumnName("prioridad_id")
                    .IsRequired();

                entity.HasOne(t => t.UsuarioSolicitante)
                    .WithMany()
                    .HasForeignKey(t => t.UsuarioSolicitanteId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(t => t.TecnicoAsignado)
                    .WithMany()
                    .HasForeignKey(t => t.TecnicoAsignadoId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(t => t.Categoria)
                    .WithMany(c => c.Tickets)
                    .HasForeignKey(t => t.CategoriaId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(t => t.EstadoTicket)
                    .WithMany(e => e.Tickets)
                    .HasForeignKey(t => t.EstadoTicketId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(t => t.Prioridad)
                    .WithMany(p => p.Tickets)
                    .HasForeignKey(t => t.PrioridadId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<BitacoraAuditoria>(entity =>
            {
                entity.ToTable("bitacora_auditoria");

                entity.HasKey(b => b.Id);

                entity.Property(b => b.Id)
                    .HasColumnName("id");

                entity.Property(b => b.TicketId)
                    .HasColumnName("ticket_id")
                    .IsRequired();

                entity.Property(b => b.UsuarioId)
                    .HasColumnName("usuario_id")
                    .IsRequired();

                entity.Property(b => b.Accion)
                    .HasColumnName("accion")
                    .HasMaxLength(100)
                    .IsRequired();

                entity.Property(b => b.Detalle)
                    .HasColumnName("detalle")
                    .HasMaxLength(1000);

                entity.Property(b => b.FechaRegistro)
                    .HasColumnName("fecha_registro")
                    .HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasOne(b => b.Ticket)
                    .WithMany()
                    .HasForeignKey(b => b.TicketId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(b => b.Usuario)
                    .WithMany()
                    .HasForeignKey(b => b.UsuarioId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<ComentarioTicket>(entity =>
            {
                entity.ToTable("comentarios_ticket");

                entity.HasKey(c => c.Id);

                entity.Property(c => c.Id)
                    .HasColumnName("id");

                entity.Property(c => c.TicketId)
                    .HasColumnName("ticket_id")
                    .IsRequired();

                entity.Property(c => c.UsuarioId)
                    .HasColumnName("usuario_id")
                    .IsRequired();

                entity.Property(c => c.Comentario)
                    .HasColumnName("comentario")
                    .HasMaxLength(1000)
                    .IsRequired();

                entity.Property(c => c.FechaRegistro)
                    .HasColumnName("fecha_registro")
                    .HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasOne(c => c.Ticket)
                    .WithMany()
                    .HasForeignKey(c => c.TicketId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(c => c.Usuario)
                    .WithMany()
                    .HasForeignKey(c => c.UsuarioId)
                    .OnDelete(DeleteBehavior.Restrict);
            });
        }
    }
}