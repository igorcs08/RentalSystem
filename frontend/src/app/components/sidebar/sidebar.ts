import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="sidebar d-flex flex-column flex-shrink-0 p-3 text-white bg-dark">
      <a href="/" class="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none">
        <i class="bi bi-film me-2" style="font-size: 1.5rem;"></i>
        <span class="fs-4">Locadora VHS</span>
      </a>
      <hr>
      <ul class="nav nav-pills flex-column mb-auto">
        <li class="nav-item">
          <a routerLink="/vhs" routerLinkActive="active" class="nav-link text-white">
            <i class="bi bi-cassette me-2"></i>
            Fitas VHS
          </a>
        </li>
        <li>
          <a routerLink="/customers" routerLinkActive="active" class="nav-link text-white">
            <i class="bi bi-people me-2"></i>
            Clientes
          </a>
        </li>
        <li>
          <a routerLink="/rentals" routerLinkActive="active" class="nav-link text-white">
            <i class="bi bi-cart-check me-2"></i>
            Empréstimos
          </a>
        </li>
      </ul>
      <hr>
      <div class="dropdown">
        <small class="text-muted text-uppercase">Admin Portal</small>
      </div>
    </div>
  `,
  styles: [`
    .sidebar {
      width: 250px;
      height: 100vh;
      position: fixed;
      top: 0;
      left: 0;
    }
    .nav-link {
      transition: all 0.3s;
    }
    .nav-link:hover {
      background-color: rgba(255,255,255,0.1);
    }
    .nav-link.active {
      background-color: #0d6efd;
    }
  `]
})
export class SidebarComponent { }
