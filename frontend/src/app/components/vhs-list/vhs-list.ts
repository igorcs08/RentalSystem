import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VhsService, VhsTape, CreateVhsTape } from '../../services/vhs.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-vhs-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>Catálogo de Fitas VHS</h2>
        <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#vhsModal" (click)="prepareNewVhs()">
          <i class="bi bi-plus-lg me-2"></i>Nova Fita
        </button>
      </div>

      <div class="card shadow-sm">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th>Título</th>
                <th>Gênero</th>
                <th>Diretor</th>
                <th>Estoque</th>
                <th>Preço/Dia</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let vhs of vhsTapes">
                <td>
                  <strong>{{ vhs.title }}</strong><br>
                  <small class="text-muted">{{ vhs.durationInMinutes }} min</small>
                </td>
                <td>{{ vhs.genre }}</td>
                <td>{{ vhs.director }}</td>
                <td>
                  <span class="badge" [ngClass]="vhs.stockQuantity > 0 ? 'bg-info' : 'bg-secondary'">
                    {{ vhs.stockQuantity }} un.
                  </span>
                </td>
                <td>{{ vhs.dailyRentalRate | currency:'BRL' }}</td>
                <td>
                  <span class="badge" [ngClass]="vhs.isAvailable ? 'bg-success' : 'bg-danger'">
                    {{ vhs.isAvailable ? 'Disponível' : 'Indisponível' }}
                  </span>
                </td>
                <td>
                  <div class="btn-group">
                    <button class="btn btn-sm btn-outline-info" data-bs-toggle="modal" data-bs-target="#vhsDetailModal" (click)="viewDetails(vhs)" title="Detalhes">
                      <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-warning" data-bs-toggle="modal" data-bs-target="#vhsModal" (click)="editVhs(vhs)" title="Editar">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" (click)="deleteVhs(vhs.id)" title="Excluir">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="isLoading">
                <td colspan="6" class="text-center py-4">
                  <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Carregando...</span>
                  </div>
                  <p class="mt-2 mb-0">Carregando catálogo...</p>
                </td>
              </tr>
              <tr *ngIf="!isLoading && vhsTapes.length === 0">
                <td colspan="6" class="text-center py-4">Nenhuma fita encontrada.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div class="modal fade" id="vhsModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditing ? 'Editar Fita VHS' : 'Nova Fita VHS' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form #vhsForm="ngForm">
              <div class="mb-3">
                <label class="form-label">Título</label>
                <input type="text" class="form-control" [(ngModel)]="newVhs.title" name="title" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Gênero</label>
                <input type="text" class="form-control" [(ngModel)]="newVhs.genre" name="genre" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Diretor</label>
                <input type="text" class="form-control" [(ngModel)]="newVhs.director" name="director" required>
              </div>
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Duração (min)</label>
                  <input type="number" class="form-control" [(ngModel)]="newVhs.durationInMinutes" name="duration" required>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Taxa Diária</label>
                  <div class="input-group">
                    <span class="input-group-text">R$</span>
                    <input type="text" class="form-control" [(ngModel)]="displayDailyRate" name="rate" (input)="onCurrencyInput($event)" placeholder="0,00" required>
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Quantidade em Estoque</label>
                  <input type="number" class="form-control" [(ngModel)]="newVhs.stockQuantity" name="stockQuantity" min="0" required>
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Descrição</label>
                <textarea class="form-control" [(ngModel)]="newVhs.description" name="description"></textarea>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" id="closeModal">Cancelar</button>
            <button type="button" class="btn btn-primary" (click)="saveVhs()" [disabled]="!vhsForm.valid">Salvar</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Detail Modal -->
    <div class="modal fade" id="vhsDetailModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content" *ngIf="selectedVhs">
          <div class="modal-header bg-info text-white">
            <h5 class="modal-title"><i class="bi bi-info-circle me-2"></i>Detalhes da Fita VHS</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="col-md-4">
                <div class="p-4 bg-light text-center rounded border h-100 d-flex flex-column justify-content-center">
                  <i class="bi bi-film display-1 text-info opacity-50 mb-3"></i>
                  <h4 class="mb-0">{{ selectedVhs.title }}</h4>
                  <p class="text-muted">{{ selectedVhs.genre }}</p>
                </div>
              </div>
              <div class="col-md-8">
                <div class="list-group list-group-flush">
                  <div class="list-group-item">
                    <small class="text-muted d-block">Diretor</small>
                    <span class="fw-bold">{{ selectedVhs.director }}</span>
                  </div>
                  <div class="list-group-item">
                    <div class="row">
                      <div class="col-6">
                        <small class="text-muted d-block">Duração</small>
                        <span class="fw-bold">{{ selectedVhs.durationInMinutes }} minutos</span>
                      </div>
                      <div class="col-6">
                        <small class="text-muted d-block">Taxa Diária</small>
                        <span class="fw-bold text-success">{{ selectedVhs.dailyRentalRate | currency:'BRL' }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="list-group-item">
                    <small class="text-muted d-block">Unidades em Estoque</small>
                    <span class="fw-bold" [class.text-danger]="selectedVhs.stockQuantity === 0">{{ selectedVhs.stockQuantity }} unidades</span>
                  </div>
                  <div class="list-group-item border-0">
                    <small class="text-muted d-block mb-1">Descrição</small>
                    <p class="mb-0 text-secondary" style="line-height: 1.6;">{{ selectedVhs.description || 'Nenhuma descrição disponível.' }}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="mt-4 p-3 rounded" [ngClass]="selectedVhs.isAvailable ? 'bg-success-subtle border-success-subtle border' : 'bg-danger-subtle border-danger-subtle border'">
              <div class="d-flex align-items-center">
                <i class="bi" [ngClass]="selectedVhs.isAvailable ? 'bi-check-circle-fill text-success' : 'bi-x-circle-fill text-danger'"></i>
                <span class="ms-2 fw-semibold" [ngClass]="selectedVhs.isAvailable ? 'text-success' : 'text-danger'">
                  Status Atual: {{ selectedVhs.isAvailable ? 'Disponível para Locação' : 'Indisponível (Sem Estoque)' }}
                </span>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary px-4" data-bs-dismiss="modal">Fechar</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card { border-radius: 12px; overflow: hidden; }
    th { font-weight: 600; text-transform: uppercase; font-size: 0.8rem; letter-spacing: 0.5px; }
    td { vertical-align: middle; }
  `]
})
export class VhsListComponent implements OnInit {
  vhsTapes: VhsTape[] = [];
  selectedVhs: VhsTape | null = null;
  newVhs: CreateVhsTape = this.getEmptyVhs();
  displayDailyRate = '';
  isLoading = false;
  isEditing = false;
  editingVhsId: string | null = null;

  constructor(
    private vhsService: VhsService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadVhs();
  }

  getEmptyVhs(): CreateVhsTape {
    return { title: '', genre: '', director: '', durationInMinutes: 0, dailyRentalRate: 0, stockQuantity: 0, description: '' };
  }

  prepareNewVhs() {
    this.isEditing = false;
    this.editingVhsId = null;
    this.resetForm();
  }

  resetForm() {
    this.newVhs = this.getEmptyVhs();
    this.displayDailyRate = '';
  }

  async loadVhs() {
    this.isLoading = true;
    try {
      this.vhsTapes = await this.vhsService.getAll();
    } catch (error) {
      console.error('Error loading VHS:', error);
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  async saveVhs() {
    try {
      // Parse displayDailyRate to numeric dailyRentalRate
      const numericRate = parseFloat(this.displayDailyRate.replace(/\./g, '').replace(',', '.'));
      this.newVhs.dailyRentalRate = isNaN(numericRate) ? 0 : numericRate;

      if (this.isEditing && this.editingVhsId) {
        await this.vhsService.update(this.editingVhsId, this.newVhs);
      } else {
        await this.vhsService.create(this.newVhs);
      }
      this.loadVhs();
      document.getElementById('closeModal')?.click();
    } catch (error) {
      alert(`Erro ao ${this.isEditing ? 'atualizar' : 'salvar'} fita.`);
    }
  }

  async deleteVhs(id: string) {
    if (confirm('Tem certeza que deseja excluir esta fita?')) {
      try {
        await this.vhsService.delete(id);
        this.loadVhs();
      } catch (error) {
        alert('Erro ao excluir fita.');
      }
    }
  }

  viewDetails(vhs: VhsTape) {
    this.selectedVhs = vhs;
    this.cdr.detectChanges();
  }

  editVhs(vhs: VhsTape) {
    this.isEditing = true;
    this.editingVhsId = vhs.id;
    this.newVhs = {
      title: vhs.title,
      genre: vhs.genre,
      director: vhs.director,
      durationInMinutes: vhs.durationInMinutes,
      dailyRentalRate: vhs.dailyRentalRate,
      stockQuantity: vhs.stockQuantity,
      description: vhs.description
    };
    this.displayDailyRate = vhs.dailyRentalRate.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    this.cdr.detectChanges();
  }

  onCurrencyInput(event: any) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');

    if (value === '') {
      this.displayDailyRate = '';
      return;
    }

    const numericValue = parseInt(value, 10) / 100;
    this.displayDailyRate = numericValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    input.value = this.displayDailyRate;
  }
}
