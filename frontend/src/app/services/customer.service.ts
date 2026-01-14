import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseService } from './base.service';

export interface Address {
    id: string;
    zipCode: string;
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
}

export interface CreateAddress {
    zipCode: string;
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
}

export interface Customer {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    address?: Address;
}

export interface CreateCustomer {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    address?: CreateAddress;
}

@Injectable({
    providedIn: 'root'
})
export class CustomerService extends BaseService<Customer, CreateCustomer, CreateCustomer> {
    constructor(http: HttpClient) {
        super('customers', http);
    }
}
