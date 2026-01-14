using Microsoft.AspNetCore.Mvc;
using RentalSystem.Application.DTOs;
using RentalSystem.Application.Interfaces;

namespace RentalSystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RentalsController : ControllerBase
{
    private readonly IRentalService _rentalService;

    public RentalsController(IRentalService rentalService)
    {
        _rentalService = rentalService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await _rentalService.GetAllAsync());

    [HttpGet("sessions")]
    public async Task<IActionResult> GetSessions() => Ok(await _rentalService.GetSessionsAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var rental = await _rentalService.GetByIdAsync(id);
        return rental == null ? NotFound() : Ok(rental);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateRentalDto dto)
    {
        try
        {
            var session = await _rentalService.CreateRentalAsync(dto);
            return Ok(session);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("return")]
    public async Task<IActionResult> Return(ReturnRentalDto dto)
    {
        var result = await _rentalService.ReturnRentalAsync(dto);
        return result ? NoContent() : BadRequest(new { message = "Unable to return rental. It may not exist or is already returned." });
    }

    [HttpPost("return-session/{id}")]
    public async Task<IActionResult> ReturnSession(Guid id)
    {
        var result = await _rentalService.ReturnSessionAsync(id);
        return result ? NoContent() : BadRequest(new { message = "Unable to return session. It may not exist or all items are already returned." });
    }
}
