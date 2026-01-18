using Microsoft.EntityFrameworkCore;
using RentalSystem.Domain.Entities;
using RentalSystem.Domain.Interfaces;
using RentalSystem.Infrastructure.Persistence;
using System.Linq.Expressions;

namespace RentalSystem.Infrastructure.Repositories;

public class RentalRepository : Repository<Rental>, IRentalRepository
{
    public RentalRepository(RentalDbContext context) : base(context)
    {
    }

    public override async Task<IEnumerable<Rental>> GetAllAsync()
    {
        return await _dbSet
            .Include(r => r.Customer)
            .Include(r => r.Product)
            .ToListAsync();
    }

    public override async Task<Rental?> GetByIdAsync(Guid id)
    {
        return await _dbSet
            .Include(r => r.Customer)
            .Include(r => r.Product)
            .FirstOrDefaultAsync(r => r.Id == id);
    }

    public override async Task<IEnumerable<Rental>> FindAsync(System.Linq.Expressions.Expression<Func<Rental, bool>> predicate)
    {
        return await _dbSet
            .Include(r => r.Customer)
            .Include(r => r.Product)
            .Where(predicate)
            .ToListAsync();
    }

    public override async Task<(IEnumerable<Rental> Items, int TotalCount)> GetPagedAsync(int pageNumber, int pageSize, Expression<Func<Rental, bool>>? predicate = null)
    {
        IQueryable<Rental> query = _dbSet.Include(r => r.Customer).Include(r => r.Product);

        if (predicate != null)
        {
            query = query.Where(predicate);
        }

        var totalCount = await query.CountAsync();
        var items = await query
            .OrderByDescending(r => r.RentalDate)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, totalCount);
    }
}
