namespace RentalSystem.Application.DTOs;

public class PaginationParams
{
    private const int MaxPageSize = 50;
    private const int MinPageSize = 10;
    private int _pageSize = 10;

    public int PageNumber { get; set; } = 1;

    public int PageSize
    {
        get => _pageSize;
        set => _pageSize = value > MaxPageSize ? MaxPageSize : (value < MinPageSize ? MinPageSize : value);
    }
}
