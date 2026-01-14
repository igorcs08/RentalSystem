import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

export abstract class BaseService<T, C, U> {
    protected apiUrl: string;

    constructor(
        endpoint: string,
        protected http: HttpClient
    ) {
        this.apiUrl = `${environment.apiUrl}/${endpoint}`;
    }

    async getAll(): Promise<T[]> {
        return lastValueFrom(this.http.get<T[]>(this.apiUrl));
    }

    async getById(id: string): Promise<T> {
        return lastValueFrom(this.http.get<T>(`${this.apiUrl}/${id}`));
    }

    async create(data: C): Promise<T> {
        return lastValueFrom(this.http.post<T>(this.apiUrl, data));
    }

    async update(id: string, data: U): Promise<void> {
        await lastValueFrom(this.http.put<void>(`${this.apiUrl}/${id}`, data));
    }

    async delete(id: string): Promise<void> {
        await lastValueFrom(this.http.delete<void>(`${this.apiUrl}/${id}`));
    }
}
