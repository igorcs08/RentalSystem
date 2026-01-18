namespace RentalSystem.Application.DTOs;

public class CustomerFilterParams : PaginationParams
{
    public string? Name { get; set; }
    public string? Email { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
}
