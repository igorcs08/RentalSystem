import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PagedResult<T> {
    items: T[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
}

export abstract class BaseService<T, C, U> {
    protected apiUrl: string;

    constructor(
        endpoint: string,
        protected http: HttpClient
    ) {
        this.apiUrl = `${environment.apiUrl}/${endpoint}`;
    }

    async getPaged(pageNumber: number = 1, pageSize: number = 10, filters: any = {}): Promise<PagedResult<T>> {
        let query = `pageNumber=${pageNumber}&pageSize=${pageSize}`;
        Object.keys(filters).forEach(key => {
            if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
                query += `&${key}=${encodeURIComponent(filters[key])}`;
            }
        });
        return lastValueFrom(this.http.get<PagedResult<T>>(`${this.apiUrl}?${query}`));
    }

    async getAll(): Promise<T[]> {
        // Keeping this for compatibility or if needed, but it might fail now if backend requires params
        // Better to update it or use getPaged
        const result = await this.getPaged(1, 1000); // Hack to get "all" if needed
        return result.items;
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
