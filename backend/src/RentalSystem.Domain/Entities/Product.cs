namespace RentalSystem.Domain.Entities;

public abstract class Product : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal DailyRentalRate { get; set; }
    public int StockQuantity { get; set; }
    public bool IsAvailable { get; set; } = true;
}
