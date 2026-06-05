using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SistemaIncidentes.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddTicketSolutionField : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "solucion",
                table: "tickets",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "solucion",
                table: "tickets");
        }
    }
}
