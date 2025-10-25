import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ItemType } from '../models/item-type';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ItemTypeService {
private apiUrl = 'http://localhost:8082/api/item-types';

    constructor(private http: HttpClient) {}

    createItemType(itemType: ItemType): Observable<ItemType> {
        return this.http.post<ItemType>(this.apiUrl, itemType).pipe(catchError(this.handleError));
    }

    getAllItemTypes(): Observable<ItemType[]> {
        return this.http.get<ItemType[]>(this.apiUrl).pipe(catchError(this.handleError));
    }

    getItemType(id: number): Observable<ItemType> {
        return this.http.get<ItemType>(`${this.apiUrl}/${id}`).pipe(catchError(this.handleError));
    }

    updateItemType(id: number, itemType: ItemType): Observable<ItemType> {
        return this.http.put<ItemType>(`${this.apiUrl}/${id}`, itemType).pipe(catchError(this.handleError));
    }

    deleteItemType(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(catchError(this.handleError));
    }

    private handleError(error: HttpErrorResponse): Observable<never> {
        let errorMessage = 'An error occurred';
        if (error.error instanceof ErrorEvent) {
            errorMessage = `Client error: ${error.error.message}`;
        } else {
            errorMessage = `Server error: ${error.status} - ${error.error?.message || error.message}`;
        }
        return throwError(() => new Error(errorMessage));
    }
}
