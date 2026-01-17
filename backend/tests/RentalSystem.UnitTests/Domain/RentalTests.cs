using RentalSystem.Domain.Entities;
using FluentAssertions;
using Xunit;

namespace RentalSystem.UnitTests.Domain;

public class RentalTests
{
    [Fact]
    public void CalculateTotalAmount_WhenReturnDateIsSet_ShouldCalculateCorrectly()
    {
        // Arrange
        var rentalDate = new DateTime(2024, 1, 1, 10, 0, 0);
        var returnDate = new DateTime(2024, 1, 3, 10, 0, 0);
        var dailyRate = 10m;
        
        var rental = new Rental
        {
            RentalDate = rentalDate,
            ReturnDate = returnDate,
            Product = new VhsTape { DailyRentalRate = dailyRate, Title = "Interstellar", StockQuantity = 5 }
        };

        // Act
        rental.CalculateTotalAmount();

        // Assert
        // 2 days * 10 = 20
        rental.TotalAmount.Should().Be(20m);
    }

    [Fact]
    public void CalculateTotalAmount_WhenReturnDateIsNull_ShouldUseExpectedReturnDate()
    {
        // Arrange
        var rentalDate = new DateTime(2024, 1, 1, 10, 0, 0);
        var expectedReturnDate = new DateTime(2024, 1, 4, 10, 0, 0);
        var dailyRate = 5m;

        var rental = new Rental
        {
            RentalDate = rentalDate,
            ExpectedReturnDate = expectedReturnDate,
            ReturnDate = null,
            Product = new VhsTape { DailyRentalRate = dailyRate, Title = "Matrix", StockQuantity = 10 }
        };

        // Act
        rental.CalculateTotalAmount();

        // Assert
        // 3 days * 5 = 15
        rental.TotalAmount.Should().Be(15m);
    }

    [Fact]
    public void CalculateTotalAmount_WhenDurationIsLessThanOneDay_ShouldChargeForOneDay()
    {
        // Arrange
        var rentalDate = new DateTime(2024, 1, 1, 10, 0, 0);
        var returnDate = new DateTime(2024, 1, 1, 11, 0, 0);
        var dailyRate = 15m;

        var rental = new Rental
        {
            RentalDate = rentalDate,
            ReturnDate = returnDate,
            Product = new VhsTape { DailyRentalRate = dailyRate, Title = "Inception", StockQuantity = 3 }
        };

        // Act
        rental.CalculateTotalAmount();

        // Assert
        rental.TotalAmount.Should().Be(15m);
    }

    [Fact]
    public void CalculateTotalAmount_WhenNoProduct_ShouldBeZero()
    {
        // Arrange
        var rental = new Rental
        {
            RentalDate = DateTime.UtcNow,
            ReturnDate = DateTime.UtcNow.AddDays(1)
        };

        // Act
        rental.CalculateTotalAmount();

        // Assert
        rental.TotalAmount.Should().Be(0);
    }
}
