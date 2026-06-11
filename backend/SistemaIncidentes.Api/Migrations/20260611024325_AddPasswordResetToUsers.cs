using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SistemaIncidentes.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddPasswordResetToUsers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "fecha_expiracion_token_reset_password",
                table: "usuarios",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "token_reset_password",
                table: "usuarios",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "fecha_expiracion_token_reset_password",
                table: "usuarios");

            migrationBuilder.DropColumn(
                name: "token_reset_password",
                table: "usuarios");
        }
    }
}
