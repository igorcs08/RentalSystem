using RentalSystem.Application.DTOs;
using RentalSystem.Application.Interfaces;
using RentalSystem.Domain.Entities;
using RentalSystem.Domain.Interfaces;
using System.Linq;

namespace RentalSystem.Application.Services;

public class RentalService : IRentalService
{
    private readonly IUnitOfWork _unitOfWork;

    public RentalService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<RentalDto?> GetByIdAsync(Guid id)
    {
        var rentals = await _unitOfWork.Rentals.FindAsync(r => r.Id == id);
        var rental = rentals.FirstOrDefault();
        return rental == null ? null : MapToDto(rental);
    }

    public async Task<IEnumerable<RentalDto>> GetAllAsync()
    {
        var rentals = await _unitOfWork.Rentals.GetAllAsync();
        foreach (var r in rentals) r.CalculateTotalAmount(); // Ensure calculations for display
        return rentals.Select(MapToDto);
    }

    public async Task<IEnumerable<RentalSessionDto>> GetSessionsAsync()
    {
        var sessions = await _unitOfWork.RentalSessions.GetAllAsync();
        foreach (var s in sessions)
        {
            foreach (var r in s.Rentals) r.CalculateTotalAmount();
        }
        return sessions.Select(MapToSessionDto);
    }

    public async Task<RentalSessionDto> CreateRentalAsync(CreateRentalDto dto)
    {
        var customer = await _unitOfWork.Customers.GetByIdAsync(dto.CustomerId);
        if (customer == null) throw new Exception("Customer not found");

        var pendingRentals = await _unitOfWork.Rentals.FindAsync(r => r.CustomerId == dto.CustomerId && r.ReturnDate == null);
        if (pendingRentals.Any())
        {
            throw new Exception("Cliente possui pendências de devolução e não pode realizar novos empréstimos.");
        }

        if (dto.ProductIds == null || !dto.ProductIds.Any())
        {
            throw new Exception("Nenhum produto selecionado para empréstimo.");
        }

        var session = new RentalSession
        {
            CustomerId = dto.CustomerId,
            Customer = customer,
            RentalDate = DateTime.UtcNow
        };

        foreach (var productId in dto.ProductIds)
        {
            var product = await _unitOfWork.VhsTapes.GetByIdAsync(productId);
            if (product == null) throw new Exception($"Product with ID {productId} not found");
            if (product.StockQuantity <= 0) throw new Exception($"Product '{product.Title}' is out of stock");

            var rental = new Rental
            {
                CustomerId = dto.CustomerId,
                Customer = customer,
                ProductId = productId,
                Product = product,
                RentalDate = session.RentalDate,
                ExpectedReturnDate = dto.ExpectedReturnDate,
                RentalSession = session
            };

            rental.CalculateTotalAmount();
            product.StockQuantity--;
            product.IsAvailable = product.StockQuantity > 0;

            session.Rentals.Add(rental);
            session.TotalAmount += rental.TotalAmount;
        }

        await _unitOfWork.RentalSessions.AddAsync(session);
        await _unitOfWork.CompleteAsync();

        return MapToSessionDto(session);
    }

    public async Task<bool> ReturnRentalAsync(ReturnRentalDto dto)
    {
        var rental = await _unitOfWork.Rentals.GetByIdAsync(dto.RentalId);
        if (rental == null || rental.ReturnDate != null) return false;

        var product = await _unitOfWork.VhsTapes.GetByIdAsync(rental.ProductId);
        if (product != null)
        {
            product.StockQuantity++;
            product.IsAvailable = true;
            rental.Product = product;
        }

        rental.ReturnDate = dto.ReturnDate;
        rental.CalculateTotalAmount();
        rental.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.CompleteAsync();
        return true;
    }

    public async Task<bool> ReturnSessionAsync(Guid sessionId)
    {
        var sessions = await _unitOfWork.RentalSessions.FindAsync(s => s.Id == sessionId);
        var session = sessions.FirstOrDefault();
        if (session == null) return false;

        var now = DateTime.UtcNow;
        foreach (var rental in session.Rentals.Where(r => r.ReturnDate == null))
        {
            var product = await _unitOfWork.VhsTapes.GetByIdAsync(rental.ProductId);
            if (product != null)
            {
                product.StockQuantity++;
                product.IsAvailable = true;
                rental.Product = product;
            }
            rental.ReturnDate = now;
            rental.CalculateTotalAmount();
            rental.UpdatedAt = now;
        }

        await _unitOfWork.CompleteAsync();
        return true;
    }

    private static RentalDto MapToDto(Rental rental) => new RentalDto
    {
        Id = rental.Id,
        CustomerId = rental.CustomerId,
        CustomerName = rental.Customer != null ? $"{rental.Customer.FirstName} {rental.Customer.LastName}" : "Unknown",
        ProductId = rental.ProductId,
        ProductTitle = rental.Product != null ? rental.Product.Title : "Unknown",
        RentalDate = DateTime.SpecifyKind(rental.RentalDate, DateTimeKind.Utc),
        ExpectedReturnDate = rental.ExpectedReturnDate.HasValue ? DateTime.SpecifyKind(rental.ExpectedReturnDate.Value, DateTimeKind.Utc) : null,
        ReturnDate = rental.ReturnDate.HasValue ? DateTime.SpecifyKind(rental.ReturnDate.Value, DateTimeKind.Utc) : null,
        TotalAmount = rental.TotalAmount,
        RentalSessionId = rental.RentalSessionId
    };

    private static RentalSessionDto MapToSessionDto(RentalSession session) => new RentalSessionDto
    {
        Id = session.Id,
        CustomerId = session.CustomerId,
        CustomerName = session.Customer != null ? $"{session.Customer.FirstName} {session.Customer.LastName}" : "Unknown",
        RentalDate = DateTime.SpecifyKind(session.RentalDate, DateTimeKind.Utc),
        TotalAmount = session.Rentals.Sum(r => r.TotalAmount),
        Rentals = session.Rentals.Select(MapToDto).ToList(),
        IsCompleted = session.Rentals.All(r => r.ReturnDate != null)
    };
}
