using RentalSystem.Domain.Entities;

namespace RentalSystem.Domain.Interfaces;

public interface IUnitOfWork : IDisposable
{
    IRepository<VhsTape> VhsTapes { get; }
    ICustomerRepository Customers { get; }
    IRentalRepository Rentals { get; }
    IRentalSessionRepository RentalSessions { get; }
    Task<int> CompleteAsync();
}
