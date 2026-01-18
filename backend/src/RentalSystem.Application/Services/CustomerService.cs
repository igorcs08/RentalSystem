using RentalSystem.Application.DTOs;
using RentalSystem.Application.Interfaces;
using RentalSystem.Domain.Entities;
using RentalSystem.Domain.Interfaces;
using System.Linq.Expressions;

namespace RentalSystem.Application.Services;

public class CustomerService : ICustomerService
{
    private readonly IUnitOfWork _unitOfWork;

    public CustomerService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<CustomerDto?> GetByIdAsync(Guid id)
    {
        var customer = await _unitOfWork.Customers.GetByIdAsync(id);
        return customer == null ? null : MapToDto(customer);
    }

    public async Task<PagedResult<CustomerDto>> GetPagedAsync(CustomerFilterParams filterParams)
    {
        Expression<Func<Customer, bool>>? predicate = null;

        if (!string.IsNullOrWhiteSpace(filterParams.Name) || 
            !string.IsNullOrWhiteSpace(filterParams.Email) || 
            !string.IsNullOrWhiteSpace(filterParams.City) || 
            !string.IsNullOrWhiteSpace(filterParams.State))
        {
            var name = filterParams.Name?.ToLower();
            var email = filterParams.Email?.ToLower();
            var city = filterParams.City?.ToLower();
            var state = filterParams.State?.ToLower();

            predicate = c => 
                (string.IsNullOrWhiteSpace(name) || (c.FirstName + " " + c.LastName).ToLower().Contains(name)) &&
                (string.IsNullOrWhiteSpace(email) || c.Email.ToLower().Contains(email)) &&
                (string.IsNullOrWhiteSpace(city) || (c.Address != null && c.Address.City.ToLower().Contains(city))) &&
                (string.IsNullOrWhiteSpace(state) || (c.Address != null && c.Address.State.ToLower().Contains(state)));
        }

        var (customers, totalCount) = await _unitOfWork.Customers.GetPagedAsync(filterParams.PageNumber, filterParams.PageSize, predicate);
        return new PagedResult<CustomerDto>
        {
            Items = customers.Select(MapToDto),
            TotalCount = totalCount,
            PageNumber = filterParams.PageNumber,
            PageSize = filterParams.PageSize
        };
    }

    public async Task<CustomerDto> CreateAsync(CreateCustomerDto dto)
    {
        var customer = new Customer
        {
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Email = dto.Email,
            PhoneNumber = dto.PhoneNumber
        };

        if (dto.Address != null)
        {
            customer.Address = new Address
            {
                ZipCode = dto.Address.ZipCode,
                Street = dto.Address.Street,
                Number = dto.Address.Number,
                Complement = dto.Address.Complement,
                Neighborhood = dto.Address.Neighborhood,
                City = dto.Address.City,
                State = dto.Address.State
            };
        }

        await _unitOfWork.Customers.AddAsync(customer);
        await _unitOfWork.CompleteAsync();

        return MapToDto(customer);
    }

    public async Task<bool> UpdateAsync(Guid id, CreateCustomerDto dto)
    {
        var customer = await _unitOfWork.Customers.GetByIdAsync(id);
        if (customer == null) return false;

        customer.FirstName = dto.FirstName;
        customer.LastName = dto.LastName;
        customer.Email = dto.Email;
        customer.PhoneNumber = dto.PhoneNumber;
        customer.UpdatedAt = DateTime.UtcNow;

        if (dto.Address != null)
        {
            if (customer.Address == null)
            {
                customer.Address = new Address();
            }

            customer.Address.ZipCode = dto.Address.ZipCode;
            customer.Address.Street = dto.Address.Street;
            customer.Address.Number = dto.Address.Number;
            customer.Address.Complement = dto.Address.Complement;
            customer.Address.Neighborhood = dto.Address.Neighborhood;
            customer.Address.City = dto.Address.City;
            customer.Address.State = dto.Address.State;
            customer.Address.UpdatedAt = DateTime.UtcNow;
        }
        else
        {
            customer.Address = null;
        }

        _unitOfWork.Customers.Update(customer);
        await _unitOfWork.CompleteAsync();
        return true;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var customer = await _unitOfWork.Customers.GetByIdAsync(id);
        if (customer == null) return false;

        _unitOfWork.Customers.Remove(customer);
        await _unitOfWork.CompleteAsync();
        return true;
    }

    private static CustomerDto MapToDto(Customer customer) => new CustomerDto
    {
        Id = customer.Id,
        FirstName = customer.FirstName,
        LastName = customer.LastName,
        Email = customer.Email,
        PhoneNumber = customer.PhoneNumber,
        Address = customer.Address == null ? null : new AddressDto
        {
            Id = customer.Address.Id,
            ZipCode = customer.Address.ZipCode,
            Street = customer.Address.Street,
            Number = customer.Address.Number,
            Complement = customer.Address.Complement,
            Neighborhood = customer.Address.Neighborhood,
            City = customer.Address.City,
            State = customer.Address.State
        }
    };
}
