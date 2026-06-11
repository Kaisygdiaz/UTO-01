using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace SistemaIncidentes.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddSlaNotifications : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "notificaciones_sla",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ticket_id = table.Column<int>(type: "integer", nullable: false),
                    tipo_alerta = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    destinatario_correo = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    destinatario_nombre = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    fecha_envio = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_notificaciones_sla", x => x.id);
                    table.ForeignKey(
                        name: "FK_notificaciones_sla_tickets_ticket_id",
                        column: x => x.ticket_id,
                        principalTable: "tickets",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_notificaciones_sla_ticket_id_tipo_alerta_destinatario_correo",
                table: "notificaciones_sla",
                columns: new[] { "ticket_id", "tipo_alerta", "destinatario_correo" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "notificaciones_sla");
        }
    }
}
