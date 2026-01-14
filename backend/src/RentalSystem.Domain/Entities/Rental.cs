using System;

namespace RentalSystem.Domain.Entities;

public class Rental : BaseEntity
{
    public Guid CustomerId { get; set; }
    public Customer Customer { get; set; } = null!;
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public DateTime RentalDate { get; set; } = DateTime.UtcNow;
    public DateTime? ExpectedReturnDate { get; set; }
    public DateTime? ReturnDate { get; set; }
    public decimal TotalAmount { get; set; }
    
    public Guid? RentalSessionId { get; set; }
    public RentalSession? RentalSession { get; set; }

    public void CalculateTotalAmount()
    {
        if (ReturnDate == null && ExpectedReturnDate == null) 
        {
            TotalAmount = 0;
            return;
        }

        var targetDate = ReturnDate ?? ExpectedReturnDate;
        var days = (targetDate!.Value - RentalDate).TotalDays;
        if (days < 1) days = 1;
        
        TotalAmount = (decimal)days * (Product?.DailyRentalRate ?? 0);
    }
}
