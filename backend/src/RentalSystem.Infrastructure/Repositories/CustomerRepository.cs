using Microsoft.EntityFrameworkCore;
using RentalSystem.Domain.Entities;
using RentalSystem.Domain.Interfaces;
using RentalSystem.Infrastructure.Persistence;
using System.Linq.Expressions;

namespace RentalSystem.Infrastructure.Repositories;

public class CustomerRepository : Repository<Customer>, ICustomerRepository
{
    public CustomerRepository(RentalDbContext context) : base(context)
    {
    }

    public override async Task<IEnumerable<Customer>> GetAllAsync()
    {
        return await _dbSet.Include(c => c.Address).ToListAsync();
    }

    public override async Task<Customer?> GetByIdAsync(Guid id)
    {
        return await _dbSet.Include(c => c.Address).FirstOrDefaultAsync(c => c.Id == id);
    }

    public override async Task<(IEnumerable<Customer> Items, int TotalCount)> GetPagedAsync(int pageNumber, int pageSize, Expression<Func<Customer, bool>>? predicate = null)
    {
        IQueryable<Customer> query = _dbSet.Include(c => c.Address);

        if (predicate != null)
        {
            query = query.Where(predicate);
        }

        var totalCount = await query.CountAsync();
        var items = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, totalCount);
    }
}
