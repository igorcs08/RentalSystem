import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RentalService, Rental, CreateRental, RentalSession } from '../../services/rental.service';
import { VhsService, VhsTape } from '../../services/vhs.service';
import { CustomerService, Customer } from '../../services/customer.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-rental-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>Histórico de Empréstimos</h2>
        <button class="btn btn-success" data-bs-toggle="modal" data-bs-target="#rentalModal" (click)="resetModal()">
          <i class="bi bi-cart-plus me-2"></i>Novo Empréstimo
        </button>
      </div>

      <div class="card shadow-sm">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th>Data</th>
                <th>Cliente</th>
                <th>Itens</th>
                <th>Total</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let session of rentals">
                <td>{{ session.rentalDate | date:'dd/MM/yyyy HH:mm':'-0300' }}</td>
                <td><strong>{{ session.customerName }}</strong></td>
                <td>
                   <span class="badge bg-light text-dark border">{{ session.rentals.length }} fitas</span>
                </td>
                <td>{{ session.totalAmount | currency:'BRL' }}</td>
                <td>
                  <span class="badge" [ngClass]="session.isCompleted ? 'bg-secondary' : 'bg-warning text-dark'">
                    {{ session.isCompleted ? 'Finalizado' : 'Ativo' }}
                  </span>
                </td>
                <td>
                  <div class="btn-group">
                    <button class="btn btn-sm btn-outline-info" data-bs-toggle="modal" data-bs-target="#detailModal" (click)="viewSessionDetails(session)" title="Ver Detalhes">
                      <i class="bi bi-eye"></i> Detalhes
                    </button>
                    <button *ngIf="!session.isCompleted" class="btn btn-sm btn-outline-primary" (click)="returnEntireSession(session.id)" title="Devolver Tudo">
                      <i class="bi bi-arrow-return-left"></i> Devolver Tudo
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="isLoading">
                <td colspan="6" class="text-center py-4">
                  <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Carregando...</span>
                  </div>
                  <p class="mt-2 mb-0">Carregando histórico...</p>
                </td>
              </tr>
              <tr *ngIf="!isLoading && rentals.length === 0">
                <td colspan="6" class="text-center py-4">Nenhum empréstimo registrado.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal Novo Empréstimo -->
    <div class="modal fade" id="rentalModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Novo Empréstimo</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form #rentalForm="ngForm">
              <div class="mb-3">
                <label class="form-label font-weight-bold">1. Selecione o Cliente</label>
                <input type="text" class="form-control mb-2" placeholder="🔍 Buscar cliente por nome..." [(ngModel)]="customerSearchTerm" name="customerSearch">
                <select class="form-select" [(ngModel)]="newRental.customerId" name="customerId" required size="5">
                  <option *ngFor="let c of filteredCustomers" [value]="c.id">{{ c.firstName }} {{ c.lastName }} ({{ c.email }})</option>
                </select>
              </div>

              <div class="mb-3">
                <label class="form-label font-weight-bold">2. Selecione as Fitas VHS</label>
                <input type="text" class="form-control mb-2" placeholder="🔍 Buscar fita por título ou gênero..." [(ngModel)]="vhsSearchTerm" name="vhsSearch">
                <select class="form-select" [(ngModel)]="newRental.productIds" name="productIds" multiple required style="height: 150px;">
                  <option *ngFor="let v of filteredVhs" [value]="v.id">
                    {{ v.title }} ({{ v.genre }}) - {{ v.dailyRentalRate | currency:'BRL' }}/dia [Estoque: {{ v.stockQuantity }}]
                  </option>
                </select>
                <div class="form-text mt-1 text-primary">
                   <i class="bi bi-info-circle me-1"></i>Segure Ctrl (ou Cmd) para selecionar múltiplas fitas.
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label font-weight-bold">3. Previsão de Devolução (Opcional)</label>
                <input type="datetime-local" class="form-control" [(ngModel)]="newRental.expectedReturnDate" name="expectedReturnDate">
              </div>
            </form>
          </div>
          <div class="modal-footer bg-light">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" id="closeRentalModal">Cancelar</button>
            <button type="button" class="btn btn-primary px-4" (click)="saveRental()" [disabled]="!rentalForm.valid">
               <i class="bi bi-check2-circle me-2"></i>Confirmar Empréstimo
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Detalhes da Sessão -->
    <div class="modal fade" id="detailModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content" *ngIf="selectedSession">
          <div class="modal-header bg-dark text-white">
            <h5 class="modal-title">Detalhes do Empréstimo - Sessão #{{ selectedSession.id.substring(0,8) }}</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body p-0">
             <div class="p-3 bg-light border-bottom">
                <div class="row">
                   <div class="col-md-6">
                      <small class="text-muted d-block">Cliente</small>
                      <strong>{{ selectedSession.customerName }}</strong>
                   </div>
                   <div class="col-md-6 text-md-end">
                      <small class="text-muted d-block">Data do Aluguel</small>
                      <strong>{{ selectedSession.rentalDate | date:'dd/MM/yyyy HH:mm':'-0300' }}</strong>
                   </div>
                </div>
             </div>
             <table class="table table-sm mb-0">
                <thead class="small text-muted text-uppercase bg-white">
                   <tr>
                      <th class="ps-3">Fita</th>
                      <th>Taxa</th>
                      <th>Previsão</th>
                      <th>Devolução</th>
                      <th>Total</th>
                      <th class="text-end pe-3">Ação</th>
                   </tr>
                </thead>
                <tbody>
                   <tr *ngFor="let r of selectedSession.rentals" [class.table-success]="r.returnDate">
                      <td class="ps-3"><strong>{{ r.productTitle }}</strong></td>
                      <td>{{ r.totalAmount / (getDays(r) || 1) | currency:'BRL' }}</td>
                      <td>{{ r.expectedReturnDate | date:'dd/MM/yyyy' }}</td>
                      <td>{{ r.returnDate ? (r.returnDate | date:'dd/MM/yyyy HH:mm') : '-' }}</td>
                      <td><strong>{{ r.totalAmount | currency:'BRL' }}</strong></td>
                      <td class="text-end pe-3">
                         <button *ngIf="!r.returnDate" class="btn btn-xs btn-primary py-0" (click)="returnVhs(r.id)">
                            Devolver
                         </button>
                         <i *ngIf="r.returnDate" class="bi bi-check-circle-fill text-success"></i>
                      </td>
                   </tr>
                </tbody>
                <tfoot class="bg-light fw-bold">
                   <tr>
                      <td colspan="4" class="text-end">TOTAL DA SESSÃO:</td>
                      <td colspan="2" class="ps-2">{{ selectedSession.totalAmount | currency:'BRL' }}</td>
                   </tr>
                </tfoot>
             </table>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Fechar</button>
            <button *ngIf="!selectedSession.isCompleted" class="btn btn-primary" (click)="returnEntireSession(selectedSession.id)">
               Devolver Todas Pendentes
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card { border-radius: 12px; overflow: hidden; }
    th { font-weight: 600; text-transform: uppercase; font-size: 0.8rem; letter-spacing: 0.5px; }
  `]
})
export class RentalListComponent implements OnInit {
  rentals: RentalSession[] = [];
  customers: Customer[] = [];
  availableVhs: VhsTape[] = [];
  newRental: CreateRental = this.getEmptyRental();
  selectedSession: RentalSession | null = null;
  isLoading = false;

  customerSearchTerm = '';
  vhsSearchTerm = '';

  constructor(
    private rentalService: RentalService,
    private vhsService: VhsService,
    private customerService: CustomerService,
    private cdr: ChangeDetectorRef
  ) { }

  get filteredCustomers() {
    if (!this.customerSearchTerm) return this.customers;
    const term = this.customerSearchTerm.toLowerCase();
    return this.customers.filter(c =>
      c.firstName.toLowerCase().includes(term) ||
      c.lastName.toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term)
    );
  }

  get filteredVhs() {
    if (!this.vhsSearchTerm) return this.availableVhs;
    const term = this.vhsSearchTerm.toLowerCase();
    return this.availableVhs.filter(v =>
      v.title.toLowerCase().includes(term) ||
      v.genre.toLowerCase().includes(term)
    );
  }

  ngOnInit(): void {
    this.loadRentals();
    this.loadDataForModal(); // Pre-load data to avoid delay when opening modal
  }

  async loadRentals() {
    this.isLoading = true;
    try {
      this.rentals = await this.rentalService.getAll();
    } catch (error) {
      console.error('Error loading rentals:', error);
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  async loadDataForModal() {
    try {
      const [allVhs, allCustomers] = await Promise.all([
        this.vhsService.getAll(),
        this.customerService.getAll()
      ]);
      this.availableVhs = allVhs.filter(v => v.isAvailable);
      this.customers = allCustomers;
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error loading data for modal:', error);
    }
  }

  getEmptyRental(): CreateRental {
    return { customerId: '', productIds: [], expectedReturnDate: null };
  }

  resetModal() {
    this.newRental = this.getEmptyRental();
  }

  async saveRental() {
    try {
      const rentalToSave = { ...this.newRental };
      if (rentalToSave.expectedReturnDate) {
        rentalToSave.expectedReturnDate = new Date(rentalToSave.expectedReturnDate).toISOString();
      }

      await this.rentalService.create(rentalToSave);
      this.loadRentals();
      this.loadDataForModal();
      this.customerSearchTerm = '';
      this.vhsSearchTerm = '';
      document.getElementById('closeRentalModal')?.click();
    } catch (error: any) {
      const message = error?.error?.message || 'Erro ao registrar empréstimo.';
      alert(message);
    }
  }

  viewSessionDetails(session: RentalSession) {
    this.selectedSession = session;
    this.cdr.detectChanges();
  }

  async returnVhs(id: string) {
    if (confirm('Confirmar devolução desta fita?')) {
      try {
        await this.rentalService.returnRental({
          rentalId: id,
          returnDate: new Date().toISOString()
        });
        await this.refreshAfterReturn();
      } catch (error) {
        alert('Erro ao processar devolução.');
      }
    }
  }

  async returnEntireSession(sessionId: string) {
    if (confirm('Deseja devolver todas as fitas pendentes desta sessão?')) {
      try {
        await this.rentalService.returnSession(sessionId);
        await this.refreshAfterReturn();
        if (this.selectedSession?.id === sessionId) {
          document.getElementById('detailModal')?.querySelector('.btn-close')?.dispatchEvent(new Event('click'));
        }
      } catch (error) {
        alert('Erro ao processar devolução em lote.');
      }
    }
  }

  async refreshAfterReturn() {
    await this.loadRentals();
    await this.loadDataForModal(); // Refresh available VHS tapes
    if (this.selectedSession) {
      // Refresh the selected session details if modal is open
      const updated = this.rentals.find(s => s.id === this.selectedSession?.id);
      this.selectedSession = updated || null;
    }
    this.cdr.detectChanges();
  }

  getDays(rental: Rental): number {
    const end = rental.returnDate ? new Date(rental.returnDate) : (rental.expectedReturnDate ? new Date(rental.expectedReturnDate) : new Date());
    const start = new Date(rental.rentalDate);
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24));
    return diff < 1 ? 1 : diff;
  }
}
