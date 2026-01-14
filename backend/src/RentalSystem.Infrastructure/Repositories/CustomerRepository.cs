using Microsoft.EntityFrameworkCore;
using RentalSystem.Domain.Entities;
using RentalSystem.Domain.Interfaces;
using RentalSystem.Infrastructure.Persistence;

namespace RentalSystem.Infrastructure.Repositories;

public class CustomerRepository : Repository<Customer>, ICustomerRepository
{
    public CustomerRepository(RentalDbContext context) : base(context)
    {
    }

    public new async Task<IEnumerable<Customer>> GetAllAsync()
    {
        return await _dbSet.Include(c => c.Address).ToListAsync();
    }

    public new async Task<Customer?> GetByIdAsync(Guid id)
    {
        return await _dbSet.Include(c => c.Address).FirstOrDefaultAsync(c => c.Id == id);
    }
}
