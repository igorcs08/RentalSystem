import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseService } from './base.service';

export interface VhsTape {
    id: string;
    title: string;
    description: string;
    dailyRentalRate: number;
    stockQuantity: number;
    isAvailable: boolean;
    director: string;
    durationInMinutes: number;
    genre: string;
}

export interface CreateVhsTape {
    title: string;
    description: string;
    dailyRentalRate: number;
    stockQuantity: number;
    director: string;
    durationInMinutes: number;
    genre: string;
}

@Injectable({
    providedIn: 'root'
})
export class VhsService extends BaseService<VhsTape, CreateVhsTape, CreateVhsTape> {
    constructor(http: HttpClient) {
        super('vhs', http);
    }
}
