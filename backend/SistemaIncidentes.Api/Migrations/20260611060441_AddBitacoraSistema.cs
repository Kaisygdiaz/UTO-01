using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace SistemaIncidentes.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddBitacoraSistema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "bitacora_sistema",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    usuario_id = table.Column<int>(type: "integer", nullable: false),
                    modulo = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    accion = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    detalle = table.Column<string>(type: "character varying(1500)", maxLength: 1500, nullable: true),
                    fecha_registro = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_bitacora_sistema", x => x.id);
                    table.ForeignKey(
                        name: "FK_bitacora_sistema_usuarios_usuario_id",
                        column: x => x.usuario_id,
                        principalTable: "usuarios",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_bitacora_sistema_usuario_id",
                table: "bitacora_sistema",
                column: "usuario_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "bitacora_sistema");
        }
    }
}
