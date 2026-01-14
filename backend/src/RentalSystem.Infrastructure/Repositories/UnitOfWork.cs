using RentalSystem.Domain.Entities;
using RentalSystem.Domain.Interfaces;
using RentalSystem.Infrastructure.Persistence;

namespace RentalSystem.Infrastructure.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly RentalDbContext _context;

    public UnitOfWork(RentalDbContext context)
    {
        _context = context;
        VhsTapes = new Repository<VhsTape>(_context);
        Customers = new CustomerRepository(_context);
        Rentals = new RentalRepository(_context);
        RentalSessions = new RentalSessionRepository(_context);
    }

    public IRepository<VhsTape> VhsTapes { get; private set; }
    public ICustomerRepository Customers { get; private set; }
    public IRentalRepository Rentals { get; private set; }
    public IRentalSessionRepository RentalSessions { get; private set; }

    public async Task<int> CompleteAsync()
    {
        return await _context.SaveChangesAsync();
    }

    public void Dispose()
    {
        _context.Dispose();
    }
}
