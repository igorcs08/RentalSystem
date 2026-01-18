using RentalSystem.Application.DTOs;

namespace RentalSystem.Application.Interfaces;

public interface IVhsService
{
    Task<VhsTapeDto?> GetByIdAsync(Guid id);
    Task<PagedResult<VhsTapeDto>> GetPagedAsync(VhsFilterParams filterParams);
    Task<VhsTapeDto> CreateAsync(CreateVhsTapeDto dto);
    Task<bool> UpdateAsync(Guid id, CreateVhsTapeDto dto);
    Task<bool> DeleteAsync(Guid id);
}

public interface ICustomerService
{
    Task<CustomerDto?> GetByIdAsync(Guid id);
    Task<PagedResult<CustomerDto>> GetPagedAsync(CustomerFilterParams filterParams);
    Task<CustomerDto> CreateAsync(CreateCustomerDto dto);
    Task<bool> UpdateAsync(Guid id, CreateCustomerDto dto);
    Task<bool> DeleteAsync(Guid id);
}

public interface IRentalService
{
    Task<RentalDto?> GetByIdAsync(Guid id);
    Task<PagedResult<RentalDto>> GetPagedAsync(PaginationParams paginationParams);
    Task<PagedResult<RentalSessionDto>> GetSessionsPagedAsync(PaginationParams paginationParams);
    Task<RentalSessionDto> CreateRentalAsync(CreateRentalDto dto);
    Task<bool> ReturnRentalAsync(ReturnRentalDto dto);
    Task<bool> ReturnSessionAsync(Guid sessionId);
}
