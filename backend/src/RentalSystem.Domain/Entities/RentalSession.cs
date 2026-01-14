using System;
using System.Collections.Generic;

namespace RentalSystem.Domain.Entities;

public class RentalSession : BaseEntity
{
    public Guid CustomerId { get; set; }
    public Customer Customer { get; set; } = null!;
    public DateTime RentalDate { get; set; } = DateTime.UtcNow;
    public decimal TotalAmount { get; set; }
    public ICollection<Rental> Rentals { get; set; } = new List<Rental>();
}
