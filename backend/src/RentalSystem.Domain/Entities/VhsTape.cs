namespace RentalSystem.Domain.Entities;

public class VhsTape : Product
{
    public string Director { get; set; } = string.Empty;
    public int DurationInMinutes { get; set; }
    public string Genre { get; set; } = string.Empty;
}
