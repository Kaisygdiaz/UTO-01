using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SistemaIncidentes.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddTicketCloseFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "calificacion_satisfaccion",
                table: "tickets",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "comentario_cierre",
                table: "tickets",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "calificacion_satisfaccion",
                table: "tickets");

            migrationBuilder.DropColumn(
                name: "comentario_cierre",
                table: "tickets");
        }
    }
}
