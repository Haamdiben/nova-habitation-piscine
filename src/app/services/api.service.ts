import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  // Auth endpoints
  login(username: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, { username, password });
  }

  register(username: string, password: string, email?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, { username, password, email });
  }

  // Realisations endpoints
  getRealisations(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/realisations`);
  }

  getRealisation(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/realisations/${id}`);
  }

  createRealisation(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/realisations`, data, {
      headers: this.getAuthHeaders(),
    });
  }

  updateRealisation(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/realisations/${id}`, data, {
      headers: this.getAuthHeaders(),
    });
  }

  deleteRealisation(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/realisations/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }

  // Photo endpoints
  uploadPhoto(realisationId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/realisations/${realisationId}/photos`, formData, {
      headers: this.getAuthHeaders(),
    });
  }

  getPhotos(realisationId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/realisations/${realisationId}/photos`);
  }

  deletePhoto(photoId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/photo/${photoId}`, {
      headers: this.getAuthHeaders(),
    });
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }
}
