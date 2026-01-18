import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { CustomerService, Customer, CreateCustomer, CreateAddress } from '../../services/customer.service';
import { FormsModule } from '@angular/forms';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>Gestão de Clientes</h2>
        <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#customerModal" (click)="prepareNewCustomer()">
          <i class="bi bi-person-plus me-2"></i>Novo Cliente
        </button>
      </div>

      <div class="card shadow-sm">
        <div class="card-body bg-light border-bottom p-3">
          <div class="row g-2">
            <div class="col-md-3">
              <input type="text" class="form-control form-control-sm" placeholder="🔍 Buscar por nome..." [(ngModel)]="filters.name" (keyup.enter)="applyFilters()">
            </div>
            <div class="col-md-3">
              <input type="text" class="form-control form-control-sm" placeholder="✉️ E-mail..." [(ngModel)]="filters.email" (keyup.enter)="applyFilters()">
            </div>
            <div class="col-md-2">
              <input type="text" class="form-control form-control-sm" placeholder="🏙️ Cidade..." [(ngModel)]="filters.city" (keyup.enter)="applyFilters()">
            </div>
            <div class="col-md-2">
              <input type="text" class="form-control form-control-sm" placeholder="📍 Estado (UF)..." [(ngModel)]="filters.state" maxlength="2" (keyup.enter)="applyFilters()">
            </div>
            <div class="col-md-2">
              <div class="btn-group w-100">
                <button class="btn btn-sm btn-primary" (click)="applyFilters()">
                  <i class="bi bi-search me-1"></i>Filtrar
                </button>
                <button class="btn btn-sm btn-outline-secondary" (click)="clearFilters()" title="Limpar Filtros">
                  <i class="bi bi-x-lg"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th>Nome Completo</th>
                <th>E-mail</th>
                <th>Telefone</th>
                <th>Localização</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let customer of customers">
                <td><strong>{{ customer.firstName }} {{ customer.lastName }}</strong></td>
                <td>{{ customer.email }}</td>
                 <td>{{ formatPhone(customer.phoneNumber) }}</td>
                 <td>
                   <span *ngIf="customer.address">
                     {{ customer.address.city }}/{{ customer.address.state }}
                   </span>
                   <span *ngIf="!customer.address" class="text-muted smaller">Sem endereço</span>
                 </td>
                 <td>
                  <div class="btn-group">
                    <button class="btn btn-sm btn-outline-info" data-bs-toggle="modal" data-bs-target="#customerDetailModal" (click)="viewDetails(customer)" title="Detalhes">
                      <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-warning" data-bs-toggle="modal" data-bs-target="#customerModal" (click)="editCustomer(customer)" title="Editar">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" (click)="deleteCustomer(customer.id)" title="Excluir">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="isLoading">
                <td colspan="4" class="text-center py-4">
                  <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Carregando...</span>
                  </div>
                  <p class="mt-2 mb-0">Carregando clientes...</p>
                </td>
              </tr>
              <tr *ngIf="!isLoading && customers.length === 0">
                <td colspan="4" class="text-center py-4">Nenhum cliente cadastrado.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="d-flex justify-content-between align-items-center mt-3 px-3 pb-3">
          <div class="text-muted small">
            Mostrando {{ (pageNumber - 1) * pageSize + 1 }} - {{ Math.min(pageNumber * pageSize, totalCount) }} de {{ totalCount }} registros
          </div>
          <div class="d-flex align-items-center">
            <select class="form-select form-select-sm me-3" style="width: auto;" [(ngModel)]="pageSize" (change)="changePageSize()">
              <option [value]="10">10 por página</option>
              <option [value]="20">20 por página</option>
              <option [value]="50">50 por página</option>
            </select>
            <nav>
              <ul class="pagination pagination-sm mb-0">
                <li class="page-item" [class.disabled]="pageNumber === 1">
                  <button class="page-item page-link" (click)="previousPage()"><i class="bi bi-chevron-left"></i></button>
                </li>
                <li class="page-item active"><span class="page-link">{{ pageNumber }} / {{ totalPages }}</span></li>
                <li class="page-item" [class.disabled]="pageNumber === totalPages">
                  <button class="page-item page-link" (click)="nextPage()"><i class="bi bi-chevron-right"></i></button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div class="modal fade" id="customerModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditing ? 'Editar Cliente' : 'Novo Cliente' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form #customerForm="ngForm">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Nome</label>
                  <input type="text" class="form-control" [(ngModel)]="newCustomer.firstName" name="firstName" required>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Sobrenome</label>
                  <input type="text" class="form-control" [(ngModel)]="newCustomer.lastName" name="lastName" required>
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">E-mail</label>
                <input type="email" class="form-control" [(ngModel)]="newCustomer.email" name="email" required email>
              </div>
              <div class="mb-3">
                <label class="form-label">Telefone</label>
                <input type="text" class="form-control" [(ngModel)]="newCustomer.phoneNumber" name="phone" (input)="onPhoneInput($event)" maxlength="15" placeholder="(00) 00000-0000" required>
              </div>

              <hr>
              <h6 class="mb-3 text-primary">Endereço</h6>
              
              <div class="row">
                <div class="col-md-4 mb-3">
                  <label class="form-label">CEP</label>
                  <div class="input-group">
                    <input type="text" class="form-control" [(ngModel)]="newCustomer.address!.zipCode" name="zipCode" (blur)="searchZipCode()" required placeholder="00000-000">
                    <span class="input-group-text" *ngIf="isSearchingZip"><div class="spinner-border spinner-border-sm"></div></span>
                  </div>
                </div>
                <div class="col-md-8 mb-3">
                  <label class="form-label">Logradouro</label>
                  <input type="text" class="form-control" [(ngModel)]="newCustomer.address!.street" name="street" required>
                </div>
              </div>

              <div class="row">
                <div class="col-md-3 mb-3">
                  <label class="form-label">Número</label>
                  <input type="text" class="form-control" [(ngModel)]="newCustomer.address!.number" name="number" required>
                </div>
                <div class="col-md-9 mb-3">
                  <label class="form-label">Complemento</label>
                  <input type="text" class="form-control" [(ngModel)]="newCustomer.address!.complement" name="complement">
                </div>
              </div>

              <div class="row">
                <div class="col-md-5 mb-3">
                  <label class="form-label">Bairro</label>
                  <input type="text" class="form-control" [(ngModel)]="newCustomer.address!.neighborhood" name="neighborhood" required>
                </div>
                <div class="col-md-5 mb-3">
                  <label class="form-label">Cidade</label>
                  <input type="text" class="form-control" [(ngModel)]="newCustomer.address!.city" name="city" required>
                </div>
                <div class="col-md-2 mb-3">
                  <label class="form-label">UF</label>
                  <input type="text" class="form-control" [(ngModel)]="newCustomer.address!.state" name="state" required maxlength="2">
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" id="closeCustomerModal">Cancelar</button>
            <button type="button" class="btn btn-primary" (click)="saveCustomer()" [disabled]="!customerForm.valid">Salvar</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Detail Modal -->
    <div class="modal fade" id="customerDetailModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content" *ngIf="selectedCustomer">
          <div class="modal-header bg-info text-white">
            <h5 class="modal-title"><i class="bi bi-person-badge me-2"></i>Detalhes do Cliente</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="row mb-4">
              <div class="col-md-4 text-center">
                <div class="bg-light p-4 rounded-circle d-inline-block mb-3 border">
                  <i class="bi bi-person-fill display-3 text-info opacity-50"></i>
                </div>
                <h4>{{ selectedCustomer.firstName }} {{ selectedCustomer.lastName }}</h4>
                <p class="text-muted"><i class="bi bi-envelope me-1"></i>{{ selectedCustomer.email }}</p>
                <p class="text-muted"><i class="bi bi-telephone me-1"></i>{{ formatPhone(selectedCustomer.phoneNumber) }}</p>
              </div>
              <div class="col-md-8 border-start">
                <h6 class="text-primary mb-3"><i class="bi bi-geo-alt-fill me-2"></i>Endereço Completo</h6>
                
                <div *ngIf="selectedCustomer.address; else noAddress">
                  <div class="row g-3">
                    <div class="col-md-12">
                      <small class="text-muted d-block">Logradouro</small>
                      <span class="fw-bold">{{ selectedCustomer.address.street }}, {{ selectedCustomer.address.number }}</span>
                      <span *ngIf="selectedCustomer.address.complement" class="ms-1 text-muted">({{ selectedCustomer.address.complement }})</span>
                    </div>
                    <div class="col-md-6">
                      <small class="text-muted d-block">Bairro</small>
                      <span class="fw-bold">{{ selectedCustomer.address.neighborhood }}</span>
                    </div>
                    <div class="col-md-6">
                      <small class="text-muted d-block">CEP</small>
                      <span class="fw-bold">{{ selectedCustomer.address.zipCode }}</span>
                    </div>
                    <div class="col-md-12">
                      <small class="text-muted d-block">Cidade / UF</small>
                      <span class="fw-bold fs-5 text-dark">{{ selectedCustomer.address.city }} - {{ selectedCustomer.address.state }}</span>
                    </div>
                  </div>
                </div>
                <ng-template #noAddress>
                  <div class="alert alert-warning">
                    Nenhum endereço cadastrado para este cliente.
                  </div>
                </ng-template>
              </div>
            </div>
            
            <div class="p-3 bg-light rounded small text-muted text-end border-top">
              ID do Cliente: {{ selectedCustomer.id }}
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
  `]
})
export class CustomerListComponent implements OnInit {
  customers: Customer[] = [];
  selectedCustomer: Customer | null = null;
  newCustomer: CreateCustomer = this.getEmptyCustomer();
  isLoading = false;
  isSearchingZip = false;
  isEditing = false;
  editingCustomerId: string | null = null;

  // Filters
  filters = {
    name: '',
    email: '',
    city: '',
    state: ''
  };

  // Pagination
  pageNumber = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;
  Math = Math;

  constructor(
    private customerService: CustomerService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadCustomers();
  }

  getEmptyCustomer(): CreateCustomer {
    return {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      address: {
        zipCode: '',
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: ''
      }
    };
  }

  prepareNewCustomer() {
    this.isEditing = false;
    this.editingCustomerId = null;
    this.resetForm();
  }

  resetForm() {
    this.newCustomer = this.getEmptyCustomer();
  }

  async loadCustomers() {
    this.isLoading = true;
    try {
      const result = await this.customerService.getPaged(this.pageNumber, this.pageSize, this.filters);
      this.customers = result.items;
      this.totalCount = result.totalCount;
      this.totalPages = result.totalPages;
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  applyFilters() {
    this.pageNumber = 1;
    this.loadCustomers();
  }

  clearFilters() {
    this.filters = {
      name: '',
      email: '',
      city: '',
      state: ''
    };
    this.applyFilters();
  }

  nextPage() {
    if (this.pageNumber < this.totalPages) {
      this.pageNumber++;
      this.loadCustomers();
    }
  }

  previousPage() {
    if (this.pageNumber > 1) {
      this.pageNumber--;
      this.loadCustomers();
    }
  }

  changePageSize() {
    this.pageNumber = 1;
    this.loadCustomers();
  }

  async saveCustomer() {
    try {
      if (this.isEditing && this.editingCustomerId) {
        await this.customerService.update(this.editingCustomerId, this.newCustomer);
      } else {
        await this.customerService.create(this.newCustomer);
      }
      this.loadCustomers();
      document.getElementById('closeCustomerModal')?.click();
    } catch (error) {
      alert(`Erro ao ${this.isEditing ? 'atualizar' : 'salvar'} cliente.`);
    }
  }

  async deleteCustomer(id: string) {
    if (confirm('Excluir este cliente?')) {
      try {
        await this.customerService.delete(id);
        this.loadCustomers();
      } catch (error) {
        alert('Erro ao excluir cliente.');
      }
    }
  }

  async searchZipCode() {
    const zip = this.newCustomer.address?.zipCode.replace(/\D/g, '');
    if (zip?.length === 8) {
      this.isSearchingZip = true;
      try {
        const data: any = await lastValueFrom(this.http.get(`https://viacep.com.br/ws/${zip}/json/`));
        if (!data.erro) {
          this.newCustomer.address!.street = data.logradouro;
          this.newCustomer.address!.neighborhood = data.bairro;
          this.newCustomer.address!.city = data.localidade;
          this.newCustomer.address!.state = data.uf;
        }
      } catch (error) {
        console.error('Error searching ZIP:', error);
      } finally {
        this.isSearchingZip = false;
        this.cdr.detectChanges();
      }
    }
  }

  viewDetails(customer: Customer) {
    this.selectedCustomer = customer;
    this.cdr.detectChanges();
  }

  editCustomer(customer: Customer) {
    this.isEditing = true;
    this.editingCustomerId = customer.id;
    this.newCustomer = {
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      phoneNumber: this.formatPhone(customer.phoneNumber),
      address: customer.address ? {
        zipCode: customer.address.zipCode,
        street: customer.address.street,
        number: customer.address.number,
        complement: customer.address.complement,
        neighborhood: customer.address.neighborhood,
        city: customer.address.city,
        state: customer.address.state
      } : {
        zipCode: '',
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: ''
      }
    };
    this.cdr.detectChanges();
  }

  onPhoneInput(event: any) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    if (value.length > 11) value = value.substring(0, 11);

    input.value = this.formatPhone(value);
    this.newCustomer.phoneNumber = input.value;
  }

  formatPhone(value: string | undefined): string {
    if (!value) return '';
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    const matchShort = cleaned.match(/^(\d{2})(\d{4,5})(\d{0,4})$/);
    if (matchShort) {
      let fmt = `(${matchShort[1]}) ${matchShort[2]}`;
      if (matchShort[3]) fmt += `-${matchShort[3]}`;
      return fmt;
    }
    if (cleaned.length > 2) {
      return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2)}`;
    }
    if (cleaned.length > 0) {
      return `(${cleaned}`;
    }
    return cleaned;
  }
}
