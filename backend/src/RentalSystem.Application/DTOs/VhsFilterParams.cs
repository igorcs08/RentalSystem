namespace RentalSystem.Application.DTOs;

public class VhsFilterParams : PaginationParams
{
    public string? Title { get; set; }
    public string? Director { get; set; }
    public string? Genre { get; set; }
}
