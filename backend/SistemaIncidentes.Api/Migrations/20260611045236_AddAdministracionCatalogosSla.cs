using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace SistemaIncidentes.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddAdministracionCatalogosSla : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "fecha_actualizacion",
                table: "prioridades",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "fecha_actualizacion",
                table: "categorias",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "configuracion_sla",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    habilitado = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    intervalo_revision_minutos = table.Column<int>(type: "integer", nullable: false, defaultValue: 1),
                    porcentaje_proximo_vencimiento = table.Column<int>(type: "integer", nullable: false, defaultValue: 25),
                    fecha_creacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    fecha_actualizacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    usuario_actualizacion_id = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_configuracion_sla", x => x.id);
                    table.ForeignKey(
                        name: "FK_configuracion_sla_usuarios_usuario_actualizacion_id",
                        column: x => x.usuario_actualizacion_id,
                        principalTable: "usuarios",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "matriz_prioridad",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    impacto = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    urgencia = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    prioridad_id = table.Column<int>(type: "integer", nullable: false),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    fecha_creacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    fecha_actualizacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_matriz_prioridad", x => x.id);
                    table.ForeignKey(
                        name: "FK_matriz_prioridad_prioridades_prioridad_id",
                        column: x => x.prioridad_id,
                        principalTable: "prioridades",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_configuracion_sla_usuario_actualizacion_id",
                table: "configuracion_sla",
                column: "usuario_actualizacion_id");

            migrationBuilder.CreateIndex(
                name: "IX_matriz_prioridad_impacto_urgencia",
                table: "matriz_prioridad",
                columns: new[] { "impacto", "urgencia" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_matriz_prioridad_prioridad_id",
                table: "matriz_prioridad",
                column: "prioridad_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "configuracion_sla");

            migrationBuilder.DropTable(
                name: "matriz_prioridad");

            migrationBuilder.DropColumn(
                name: "fecha_actualizacion",
                table: "prioridades");

            migrationBuilder.DropColumn(
                name: "fecha_actualizacion",
                table: "categorias");
        }
    }
}
