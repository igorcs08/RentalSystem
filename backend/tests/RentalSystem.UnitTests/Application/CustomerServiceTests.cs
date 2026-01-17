using Moq;
using RentalSystem.Application.Services;
using RentalSystem.Application.DTOs;
using RentalSystem.Domain.Entities;
using RentalSystem.Domain.Interfaces;
using FluentAssertions;
using Xunit;

namespace RentalSystem.UnitTests.Application;

public class CustomerServiceTests
{
    private readonly Mock<IUnitOfWork> _uowMock;
    private readonly CustomerService _service;

    public CustomerServiceTests()
    {
        _uowMock = new Mock<IUnitOfWork>();
        _uowMock.Setup(u => u.Customers).Returns(new Mock<ICustomerRepository>().Object);
        _service = new CustomerService(_uowMock.Object);
    }

    [Fact]
    public async Task GetByIdAsync_WhenCustomerExists_ShouldReturnDto()
    {
        // Arrange
        var customerId = Guid.NewGuid();
        var customer = new Customer { Id = customerId, FirstName = "John", LastName = "Doe" };
        _uowMock.Setup(u => u.Customers.GetByIdAsync(customerId)).ReturnsAsync(customer);

        // Act
        var result = await _service.GetByIdAsync(customerId);

        // Assert
        result.Should().NotBeNull();
        result!.FirstName.Should().Be("John");
    }

    [Fact]
    public async Task CreateAsync_ShouldAddAndComplete()
    {
        // Arrange
        var dto = new CreateCustomerDto { FirstName = "Jane", LastName = "Smith" };

        // Act
        var result = await _service.CreateAsync(dto);

        // Assert
        result.Should().NotBeNull();
        result.FirstName.Should().Be("Jane");
        _uowMock.Verify(u => u.Customers.AddAsync(It.IsAny<Customer>()), Times.Once);
        _uowMock.Verify(u => u.CompleteAsync(), Times.Once);
    }
}
