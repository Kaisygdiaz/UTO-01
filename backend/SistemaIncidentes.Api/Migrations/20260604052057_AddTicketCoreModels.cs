using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace SistemaIncidentes.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddTicketCoreModels : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "categorias",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    nombre = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    descripcion = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: true),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    fecha_creacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_categorias", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "estados_ticket",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    nombre = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    descripcion = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_estados_ticket", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "prioridades",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    nombre = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    descripcion = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    tiempo_respuesta_horas = table.Column<int>(type: "integer", nullable: false),
                    tiempo_resolucion_horas = table.Column<int>(type: "integer", nullable: false),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_prioridades", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "tickets",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    titulo = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    descripcion = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    impacto = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    urgencia = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    fecha_creacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    fecha_primera_respuesta = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    fecha_resolucion = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    fecha_cierre = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    usuario_solicitante_id = table.Column<int>(type: "integer", nullable: false),
                    tecnico_asignado_id = table.Column<int>(type: "integer", nullable: true),
                    categoria_id = table.Column<int>(type: "integer", nullable: false),
                    estado_ticket_id = table.Column<int>(type: "integer", nullable: false),
                    prioridad_id = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tickets", x => x.id);
                    table.ForeignKey(
                        name: "FK_tickets_categorias_categoria_id",
                        column: x => x.categoria_id,
                        principalTable: "categorias",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_tickets_estados_ticket_estado_ticket_id",
                        column: x => x.estado_ticket_id,
                        principalTable: "estados_ticket",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_tickets_prioridades_prioridad_id",
                        column: x => x.prioridad_id,
                        principalTable: "prioridades",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_tickets_usuarios_tecnico_asignado_id",
                        column: x => x.tecnico_asignado_id,
                        principalTable: "usuarios",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_tickets_usuarios_usuario_solicitante_id",
                        column: x => x.usuario_solicitante_id,
                        principalTable: "usuarios",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_categorias_nombre",
                table: "categorias",
                column: "nombre",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_estados_ticket_nombre",
                table: "estados_ticket",
                column: "nombre",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_prioridades_nombre",
                table: "prioridades",
                column: "nombre",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_tickets_categoria_id",
                table: "tickets",
                column: "categoria_id");

            migrationBuilder.CreateIndex(
                name: "IX_tickets_estado_ticket_id",
                table: "tickets",
                column: "estado_ticket_id");

            migrationBuilder.CreateIndex(
                name: "IX_tickets_prioridad_id",
                table: "tickets",
                column: "prioridad_id");

            migrationBuilder.CreateIndex(
                name: "IX_tickets_tecnico_asignado_id",
                table: "tickets",
                column: "tecnico_asignado_id");

            migrationBuilder.CreateIndex(
                name: "IX_tickets_usuario_solicitante_id",
                table: "tickets",
                column: "usuario_solicitante_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "tickets");

            migrationBuilder.DropTable(
                name: "categorias");

            migrationBuilder.DropTable(
                name: "estados_ticket");

            migrationBuilder.DropTable(
                name: "prioridades");
        }
    }
}
