using Microsoft.EntityFrameworkCore;
using RentalSystem.Domain.Entities;
using RentalSystem.Domain.Interfaces;
using RentalSystem.Infrastructure.Persistence;
using System.Linq.Expressions;

namespace RentalSystem.Infrastructure.Repositories;

public class RentalSessionRepository : Repository<RentalSession>, IRentalSessionRepository
{
    public RentalSessionRepository(RentalDbContext context) : base(context)
    {
    }

    public override async Task<IEnumerable<RentalSession>> GetAllAsync()
    {
        return await _dbSet
            .Include(s => s.Customer)
            .Include(s => s.Rentals)
                .ThenInclude(r => r.Product)
            .OrderByDescending(s => s.RentalDate)
            .ToListAsync();
    }

    public override async Task<IEnumerable<RentalSession>> FindAsync(System.Linq.Expressions.Expression<Func<RentalSession, bool>> predicate)
    {
        return await _dbSet
            .Include(s => s.Customer)
            .Include(s => s.Rentals)
                .ThenInclude(r => r.Product)
            .Where(predicate)
            .ToListAsync();
    }

    public override async Task<(IEnumerable<RentalSession> Items, int TotalCount)> GetPagedAsync(int pageNumber, int pageSize, Expression<Func<RentalSession, bool>>? predicate = null)
    {
        IQueryable<RentalSession> query = _dbSet
            .Include(s => s.Customer)
            .Include(s => s.Rentals)
                .ThenInclude(r => r.Product);

        if (predicate != null)
        {
            query = query.Where(predicate);
        }

        var totalCount = await query.CountAsync();
        var items = await query
            .OrderByDescending(s => s.RentalDate)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, totalCount);
    }
}
