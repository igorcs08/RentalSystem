using Microsoft.EntityFrameworkCore;
using RentalSystem.Domain.Entities;

namespace RentalSystem.Infrastructure.Persistence;

public class RentalDbContext : DbContext
{
    public RentalDbContext(DbContextOptions<RentalDbContext> options) : base(options)
    {
    }

    public DbSet<Product> Products { get; set; }
    public DbSet<VhsTape> VhsTapes { get; set; }
    public DbSet<Customer> Customers { get; set; }
    public DbSet<Rental> Rentals { get; set; }
    public DbSet<RentalSession> RentalSessions { get; set; }
    public DbSet<Address> Addresses { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // TPH (Table Per Hierarchy) for Products
        modelBuilder.Entity<Product>()
            .HasDiscriminator<string>("ProductType")
            .HasValue<VhsTape>("VhsTape");

        modelBuilder.Entity<Customer>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(255);
            entity.HasIndex(e => e.Email).IsUnique();
            
            entity.HasOne(e => e.Address)
                .WithOne(e => e.Customer)
                .HasForeignKey<Address>(e => e.CustomerId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Address>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ZipCode).IsRequired().HasMaxLength(9);
            entity.Property(e => e.Street).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Number).IsRequired().HasMaxLength(20);
            entity.Property(e => e.Neighborhood).IsRequired().HasMaxLength(100);
            entity.Property(e => e.City).IsRequired().HasMaxLength(100);
            entity.Property(e => e.State).IsRequired().HasMaxLength(2);
        });

        modelBuilder.Entity<Rental>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.Customer)
                .WithMany()
                .HasForeignKey(e => e.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Product)
                .WithMany()
                .HasForeignKey(e => e.ProductId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.RentalSession)
                .WithMany(s => s.Rentals)
                .HasForeignKey(e => e.RentalSessionId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<RentalSession>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.Customer)
                .WithMany()
                .HasForeignKey(e => e.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
