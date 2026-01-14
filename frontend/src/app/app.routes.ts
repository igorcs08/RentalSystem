import { Routes } from '@angular/router';
import { VhsListComponent } from './components/vhs-list/vhs-list';
import { CustomerListComponent } from './components/customer-list/customer-list';
import { RentalListComponent } from './components/rental-list/rental-list';

export const routes: Routes = [
    { path: '', redirectTo: 'vhs', pathMatch: 'full' },
    { path: 'vhs', component: VhsListComponent },
    { path: 'customers', component: CustomerListComponent },
    { path: 'rentals', component: RentalListComponent },
    { path: '**', redirectTo: 'vhs' }
];
