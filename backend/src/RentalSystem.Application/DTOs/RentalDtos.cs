namespace RentalSystem.Application.DTOs;

public class RentalDto
{
    public Guid Id { get; set; }
    public Guid CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public Guid ProductId { get; set; }
    public string ProductTitle { get; set; } = string.Empty;
    public DateTime RentalDate { get; set; }
    public DateTime? ExpectedReturnDate { get; set; }
    public DateTime? ReturnDate { get; set; }
    public decimal TotalAmount { get; set; }
    public Guid? RentalSessionId { get; set; }
}

public class RentalSessionDto
{
    public Guid Id { get; set; }
    public Guid CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public DateTime RentalDate { get; set; }
    public decimal TotalAmount { get; set; }
    public List<RentalDto> Rentals { get; set; } = new();
    public bool IsCompleted { get; set; }
}

public class CreateRentalDto
{
    public Guid CustomerId { get; set; }
    public List<Guid> ProductIds { get; set; } = new();
    public DateTime? ExpectedReturnDate { get; set; }
}

public class ReturnRentalDto
{
    public Guid RentalId { get; set; }
    public DateTime ReturnDate { get; set; }
}
