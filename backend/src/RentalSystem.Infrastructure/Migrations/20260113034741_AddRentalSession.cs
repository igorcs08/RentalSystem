using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RentalSystem.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddRentalSession : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "RentalSessionId",
                table: "Rentals",
                type: "TEXT",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "RentalSessions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    CustomerId = table.Column<Guid>(type: "TEXT", nullable: false),
                    RentalDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    TotalAmount = table.Column<decimal>(type: "TEXT", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RentalSessions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RentalSessions_Customers_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "Customers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Rentals_RentalSessionId",
                table: "Rentals",
                column: "RentalSessionId");

            migrationBuilder.CreateIndex(
                name: "IX_RentalSessions_CustomerId",
                table: "RentalSessions",
                column: "CustomerId");

            migrationBuilder.AddForeignKey(
                name: "FK_Rentals_RentalSessions_RentalSessionId",
                table: "Rentals",
                column: "RentalSessionId",
                principalTable: "RentalSessions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Rentals_RentalSessions_RentalSessionId",
                table: "Rentals");

            migrationBuilder.DropTable(
                name: "RentalSessions");

            migrationBuilder.DropIndex(
                name: "IX_Rentals_RentalSessionId",
                table: "Rentals");

            migrationBuilder.DropColumn(
                name: "RentalSessionId",
                table: "Rentals");
        }
    }
}
