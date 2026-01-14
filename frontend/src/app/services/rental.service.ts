import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { BaseService } from './base.service';

export interface Rental {
    id: string;
    customerId: string;
    customerName: string;
    productId: string;
    productTitle: string;
    rentalDate: string;
    expectedReturnDate: string | null;
    returnDate: string | null;
    totalAmount: number;
    rentalSessionId?: string | null;
}

export interface RentalSession {
    id: string;
    customerId: string;
    customerName: string;
    rentalDate: string;
    totalAmount: number;
    rentals: Rental[];
    isCompleted: boolean;
}

export interface CreateRental {
    customerId: string;
    productIds: string[];
    expectedReturnDate?: string | null;
}

export interface ReturnRental {
    rentalId: string;
    returnDate: string;
}

@Injectable({
    providedIn: 'root'
})
export class RentalService extends BaseService<RentalSession, CreateRental, any> {
    constructor(http: HttpClient) {
        super('rentals', http);
    }

    override async getAll(): Promise<RentalSession[]> {
        return this.getSessions();
    }

    override async create(data: CreateRental): Promise<RentalSession> {
        return lastValueFrom(this.http.post<RentalSession>(this.apiUrl, data));
    }

    async getSessions(): Promise<RentalSession[]> {
        return lastValueFrom(this.http.get<RentalSession[]>(`${this.apiUrl}/sessions`));
    }

    async returnRental(data: ReturnRental): Promise<void> {
        await lastValueFrom(this.http.post<void>(`${this.apiUrl}/return`, data));
    }

    async returnSession(id: string): Promise<void> {
        await lastValueFrom(this.http.post<void>(`${this.apiUrl}/return-session/${id}`, {}));
    }
}
