using Microsoft.AspNetCore.Mvc;
using RentalSystem.Application.DTOs;
using RentalSystem.Application.Interfaces;

namespace RentalSystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VhsController : ControllerBase
{
    private readonly IVhsService _vhsService;

    public VhsController(IVhsService vhsService)
    {
        _vhsService = vhsService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] VhsFilterParams filterParams) => 
        Ok(await _vhsService.GetPagedAsync(filterParams));

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var vhs = await _vhsService.GetByIdAsync(id);
        return vhs == null ? NotFound() : Ok(vhs);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateVhsTapeDto dto)
    {
        var vhs = await _vhsService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = vhs.Id }, vhs);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, CreateVhsTapeDto dto)
    {
        var result = await _vhsService.UpdateAsync(id, dto);
        return result ? NoContent() : NotFound();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _vhsService.DeleteAsync(id);
        return result ? NoContent() : NotFound();
    }
}
