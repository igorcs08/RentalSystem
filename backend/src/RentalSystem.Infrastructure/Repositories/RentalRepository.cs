using Microsoft.EntityFrameworkCore;
using RentalSystem.Domain.Entities;
using RentalSystem.Domain.Interfaces;
using RentalSystem.Infrastructure.Persistence;

namespace RentalSystem.Infrastructure.Repositories;

public class RentalRepository : Repository<Rental>, IRentalRepository
{
    public RentalRepository(RentalDbContext context) : base(context)
    {
    }

    public new async Task<IEnumerable<Rental>> GetAllAsync()
    {
        return await _dbSet
            .Include(r => r.Customer)
            .Include(r => r.Product)
            .ToListAsync();
    }

    public new async Task<Rental?> GetByIdAsync(Guid id)
    {
        return await _dbSet
            .Include(r => r.Customer)
            .Include(r => r.Product)
            .FirstOrDefaultAsync(r => r.Id == id);
    }

    public new async Task<IEnumerable<Rental>> FindAsync(System.Linq.Expressions.Expression<Func<Rental, bool>> predicate)
    {
        return await _dbSet
            .Include(r => r.Customer)
            .Include(r => r.Product)
            .Where(predicate)
            .ToListAsync();
    }
}
