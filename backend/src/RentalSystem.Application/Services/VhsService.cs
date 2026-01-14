using RentalSystem.Application.DTOs;
using RentalSystem.Application.Interfaces;
using RentalSystem.Domain.Entities;
using RentalSystem.Domain.Interfaces;

namespace RentalSystem.Application.Services;

public class VhsService : IVhsService
{
    private readonly IUnitOfWork _unitOfWork;

    public VhsService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<VhsTapeDto?> GetByIdAsync(Guid id)
    {
        var vhs = await _unitOfWork.VhsTapes.GetByIdAsync(id);
        return vhs == null ? null : MapToDto(vhs);
    }

    public async Task<IEnumerable<VhsTapeDto>> GetAllAsync()
    {
        var tapes = await _unitOfWork.VhsTapes.GetAllAsync();
        return tapes.Select(MapToDto);
    }

    public async Task<VhsTapeDto> CreateAsync(CreateVhsTapeDto dto)
    {
        var vhs = new VhsTape
        {
            Title = dto.Title,
            Description = dto.Description,
            DailyRentalRate = dto.DailyRentalRate,
            StockQuantity = dto.StockQuantity,
            IsAvailable = dto.StockQuantity > 0,
            Director = dto.Director,
            DurationInMinutes = dto.DurationInMinutes,
            Genre = dto.Genre
        };

        await _unitOfWork.VhsTapes.AddAsync(vhs);
        await _unitOfWork.CompleteAsync();

        return MapToDto(vhs);
    }

    public async Task<bool> UpdateAsync(Guid id, CreateVhsTapeDto dto)
    {
        var vhs = await _unitOfWork.VhsTapes.GetByIdAsync(id);
        if (vhs == null) return false;

        vhs.Title = dto.Title;
        vhs.Description = dto.Description;
        vhs.DailyRentalRate = dto.DailyRentalRate;
        vhs.StockQuantity = dto.StockQuantity;
        vhs.IsAvailable = dto.StockQuantity > 0;
        vhs.Director = dto.Director;
        vhs.DurationInMinutes = dto.DurationInMinutes;
        vhs.Genre = dto.Genre;
        vhs.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.VhsTapes.Update(vhs);
        await _unitOfWork.CompleteAsync();
        return true;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var vhs = await _unitOfWork.VhsTapes.GetByIdAsync(id);
        if (vhs == null) return false;

        _unitOfWork.VhsTapes.Remove(vhs);
        await _unitOfWork.CompleteAsync();
        return true;
    }

    private static VhsTapeDto MapToDto(VhsTape vhs) => new VhsTapeDto
    {
        Id = vhs.Id,
        Title = vhs.Title,
        Description = vhs.Description,
        DailyRentalRate = vhs.DailyRentalRate,
        StockQuantity = vhs.StockQuantity,
        IsAvailable = vhs.IsAvailable,
        Director = vhs.Director,
        DurationInMinutes = vhs.DurationInMinutes,
        Genre = vhs.Genre
    };
}
