using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace SistemaIncidentes.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddTicketAttachments : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_bitacora_auditoria_tickets_ticket_id",
                table: "bitacora_auditoria");

            migrationBuilder.DropForeignKey(
                name: "FK_comentarios_ticket_tickets_ticket_id",
                table: "comentarios_ticket");

            migrationBuilder.CreateTable(
                name: "adjuntos_ticket",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ticket_id = table.Column<int>(type: "integer", nullable: false),
                    usuario_id = table.Column<int>(type: "integer", nullable: false),
                    nombre_archivo_original = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    nombre_archivo_guardado = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    ruta_archivo = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    tipo_contenido = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    tamano_bytes = table.Column<long>(type: "bigint", nullable: false),
                    descripcion = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    fecha_carga = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_adjuntos_ticket", x => x.id);
                    table.ForeignKey(
                        name: "FK_adjuntos_ticket_tickets_ticket_id",
                        column: x => x.ticket_id,
                        principalTable: "tickets",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_adjuntos_ticket_usuarios_usuario_id",
                        column: x => x.usuario_id,
                        principalTable: "usuarios",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_adjuntos_ticket_ticket_id",
                table: "adjuntos_ticket",
                column: "ticket_id");

            migrationBuilder.CreateIndex(
                name: "IX_adjuntos_ticket_usuario_id",
                table: "adjuntos_ticket",
                column: "usuario_id");

            migrationBuilder.AddForeignKey(
                name: "FK_bitacora_auditoria_tickets_ticket_id",
                table: "bitacora_auditoria",
                column: "ticket_id",
                principalTable: "tickets",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_comentarios_ticket_tickets_ticket_id",
                table: "comentarios_ticket",
                column: "ticket_id",
                principalTable: "tickets",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_bitacora_auditoria_tickets_ticket_id",
                table: "bitacora_auditoria");

            migrationBuilder.DropForeignKey(
                name: "FK_comentarios_ticket_tickets_ticket_id",
                table: "comentarios_ticket");

            migrationBuilder.DropTable(
                name: "adjuntos_ticket");

            migrationBuilder.AddForeignKey(
                name: "FK_bitacora_auditoria_tickets_ticket_id",
                table: "bitacora_auditoria",
                column: "ticket_id",
                principalTable: "tickets",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_comentarios_ticket_tickets_ticket_id",
                table: "comentarios_ticket",
                column: "ticket_id",
                principalTable: "tickets",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
