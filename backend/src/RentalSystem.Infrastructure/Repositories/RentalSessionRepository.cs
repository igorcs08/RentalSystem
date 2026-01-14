using Microsoft.EntityFrameworkCore;
using RentalSystem.Domain.Entities;
using RentalSystem.Domain.Interfaces;
using RentalSystem.Infrastructure.Persistence;

namespace RentalSystem.Infrastructure.Repositories;

public class RentalSessionRepository : Repository<RentalSession>, IRentalSessionRepository
{
    public RentalSessionRepository(RentalDbContext context) : base(context)
    {
    }

    public new async Task<IEnumerable<RentalSession>> GetAllAsync()
    {
        return await _dbSet
            .Include(s => s.Customer)
            .Include(s => s.Rentals)
                .ThenInclude(r => r.Product)
            .OrderByDescending(s => s.RentalDate)
            .ToListAsync();
    }

    public new async Task<IEnumerable<RentalSession>> FindAsync(System.Linq.Expressions.Expression<Func<RentalSession, bool>> predicate)
    {
        return await _dbSet
            .Include(s => s.Customer)
            .Include(s => s.Rentals)
                .ThenInclude(r => r.Product)
            .Where(predicate)
            .ToListAsync();
    }
}
