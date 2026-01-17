using Moq;
using RentalSystem.Application.Services;
using RentalSystem.Application.DTOs;
using RentalSystem.Domain.Entities;
using RentalSystem.Domain.Interfaces;
using FluentAssertions;
using Xunit;

namespace RentalSystem.UnitTests.Application;

public class VhsServiceTests
{
    private readonly Mock<IUnitOfWork> _uowMock;
    private readonly VhsService _service;

    public VhsServiceTests()
    {
        _uowMock = new Mock<IUnitOfWork>();
        _uowMock.Setup(u => u.VhsTapes).Returns(new Mock<IRepository<VhsTape>>().Object);
        _service = new VhsService(_uowMock.Object);
    }

    [Fact]
    public async Task GetByIdAsync_WhenVhsExists_ShouldReturnDto()
    {
        // Arrange
        var vhsId = Guid.NewGuid();
        var vhs = new VhsTape { Id = vhsId, Title = "Interstellar", StockQuantity = 5 };
        _uowMock.Setup(u => u.VhsTapes.GetByIdAsync(vhsId)).ReturnsAsync(vhs);

        // Act
        var result = await _service.GetByIdAsync(vhsId);

        // Assert
        result.Should().NotBeNull();
        result!.Title.Should().Be("Interstellar");
    }

    [Fact]
    public async Task CreateAsync_ShouldAddAndComplete()
    {
        // Arrange
        var dto = new CreateVhsTapeDto { Title = "Matrix", StockQuantity = 10, DailyRentalRate = 5 };

        // Act
        var result = await _service.CreateAsync(dto);

        // Assert
        result.Should().NotBeNull();
        result.Title.Should().Be("Matrix");
        _uowMock.Verify(u => u.VhsTapes.AddAsync(It.IsAny<VhsTape>()), Times.Once);
        _uowMock.Verify(u => u.CompleteAsync(), Times.Once);
    }
}
