namespace RentalSystem.Application.DTOs;

public class VhsTapeDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal DailyRentalRate { get; set; }
    public bool IsAvailable { get; set; }
    public int StockQuantity { get; set; }
    public string Director { get; set; } = string.Empty;
    public int DurationInMinutes { get; set; }
    public string Genre { get; set; } = string.Empty;
}

public class CreateVhsTapeDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal DailyRentalRate { get; set; }
    public int StockQuantity { get; set; }
    public string Director { get; set; } = string.Empty;
    public int DurationInMinutes { get; set; }
    public string Genre { get; set; } = string.Empty;
}
