using Moq;
using RentalSystem.Application.Services;
using RentalSystem.Application.DTOs;
using RentalSystem.Domain.Entities;
using RentalSystem.Domain.Interfaces;
using FluentAssertions;
using Xunit;
using System.Linq.Expressions;

namespace RentalSystem.UnitTests.Application;

public class RentalServiceTests
{
    private readonly Mock<IUnitOfWork> _uowMock;
    private readonly RentalService _service;

    public RentalServiceTests()
    {
        _uowMock = new Mock<IUnitOfWork>();
        
        // Mock repositories within UnitOfWork
        _uowMock.Setup(u => u.Customers).Returns(new Mock<ICustomerRepository>().Object);
        _uowMock.Setup(u => u.Rentals).Returns(new Mock<IRentalRepository>().Object);
        _uowMock.Setup(u => u.VhsTapes).Returns(new Mock<IRepository<VhsTape>>().Object);
        _uowMock.Setup(u => u.RentalSessions).Returns(new Mock<IRentalSessionRepository>().Object);
        
        _service = new RentalService(_uowMock.Object);
    }

    [Fact]
    public async Task CreateRentalAsync_WhenCustomerNotFound_ShouldThrowException()
    {
        // Arrange
        var customerId = Guid.NewGuid();
        _uowMock.Setup(u => u.Customers.GetByIdAsync(customerId))
                .ReturnsAsync((Customer?)null);

        var dto = new CreateRentalDto { CustomerId = customerId };

        // Act
        var act = () => _service.CreateRentalAsync(dto);

        // Assert
        await act.Should().ThrowAsync<Exception>().WithMessage("Customer not found");
    }

    [Fact]
    public async Task CreateRentalAsync_WhenCustomerHasPendingRentals_ShouldThrowException()
    {
        // Arrange
        var customerId = Guid.NewGuid();
        var customer = new Customer { Id = customerId, FirstName = "John", LastName = "Doe" };
        var pendingRental = new Rental { CustomerId = customerId, ReturnDate = null };
        
        _uowMock.Setup(u => u.Customers.GetByIdAsync(customerId))
                .ReturnsAsync(customer);
        
        _uowMock.Setup(u => u.Rentals.FindAsync(It.IsAny<Expression<Func<Rental, bool>>>()))
                .ReturnsAsync(new List<Rental> { pendingRental });

        var dto = new CreateRentalDto { CustomerId = customerId };

        // Act
        var act = () => _service.CreateRentalAsync(dto);

        // Assert
        await act.Should().ThrowAsync<Exception>().WithMessage("Cliente possui pendências de devolução e não pode realizar novos empréstimos.");
    }

    [Fact]
    public async Task CreateRentalAsync_WhenProductOutOfStock_ShouldThrowException()
    {
        // Arrange
        var customerId = Guid.NewGuid();
        var productId = Guid.NewGuid();
        var customer = new Customer { Id = customerId, FirstName = "John", LastName = "Doe" };
        var product = new VhsTape { Id = productId, Title = "No Stock Movie", StockQuantity = 0 };

        _uowMock.Setup(u => u.Customers.GetByIdAsync(customerId))
                .ReturnsAsync(customer);
        _uowMock.Setup(u => u.Rentals.FindAsync(It.IsAny<Expression<Func<Rental, bool>>>()))
                .ReturnsAsync(new List<Rental>());
        _uowMock.Setup(u => u.VhsTapes.GetByIdAsync(productId))
                .ReturnsAsync(product);

        var dto = new CreateRentalDto 
        { 
            CustomerId = customerId, 
            ProductIds = new List<Guid> { productId } 
        };

        // Act
        var act = () => _service.CreateRentalAsync(dto);

        // Assert
        await act.Should().ThrowAsync<Exception>().WithMessage($"Product '{product.Title}' is out of stock");
    }

    [Fact]
    public async Task CreateRentalAsync_SuccessfulCreation_ShouldReturnSessionDto()
    {
        // Arrange
        var customerId = Guid.NewGuid();
        var productId = Guid.NewGuid();
        var customer = new Customer { Id = customerId, FirstName = "John", LastName = "Doe" };
        var product = new VhsTape { Id = productId, Title = "Good Movie", StockQuantity = 5, DailyRentalRate = 10 };

        _uowMock.Setup(u => u.Customers.GetByIdAsync(customerId))
                .ReturnsAsync(customer);
        _uowMock.Setup(u => u.Rentals.FindAsync(It.IsAny<Expression<Func<Rental, bool>>>()))
                .ReturnsAsync(new List<Rental>());
        _uowMock.Setup(u => u.VhsTapes.GetByIdAsync(productId))
                .ReturnsAsync(product);

        var dto = new CreateRentalDto 
        { 
            CustomerId = customerId, 
            ProductIds = new List<Guid> { productId },
            ExpectedReturnDate = DateTime.UtcNow.AddDays(2)
        };

        // Act
        var result = await _service.CreateRentalAsync(dto);

        // Assert
        result.Should().NotBeNull();
        result.CustomerId.Should().Be(customerId);
        result.Rentals.Should().HaveCount(1);
        result.Rentals.First().ProductId.Should().Be(productId);
        
        _uowMock.Verify(u => u.RentalSessions.AddAsync(It.IsAny<RentalSession>()), Times.Once);
        _uowMock.Verify(u => u.CompleteAsync(), Times.Once);
        product.StockQuantity.Should().Be(4);
    }
}
