import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';

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

  // Realisations (categories: Piscines, Rénovations de bâtiments, ...)
  getRealisations(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/realisations`);
  }

  getRealisation(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/realisations/${id}`);
  }

  createRealisation(name: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/realisations`,
      { name },
      { headers: this.getAuthHeaders() },
    );
  }

  deleteRealisation(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/realisations/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }

  // Chantiers (individual projects under a realisation category)
  getChantiers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/chantiers`);
  }

  getChantier(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/chantiers/${id}`);
  }

  createChantier(data: { title: string; description: string; realisationId: number }): Observable<any> {
    return this.http.post(`${this.apiUrl}/chantiers`, data, {
      headers: this.getAuthHeaders(),
    });
  }

  updateChantier(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/chantiers/${id}`, data, {
      headers: this.getAuthHeaders(),
    });
  }

  deleteChantier(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/chantiers/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }

  // Photo endpoints
  uploadPhoto(chantierId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/chantiers/${chantierId}/photos`, formData, {
      headers: this.getAuthHeaders(),
    });
  }

  uploadPhotos(chantierId: number, files: File[]): Observable<any[]> {
    if (files.length === 0) {
      return of([]);
    }
    return forkJoin(files.map((file) => this.uploadPhoto(chantierId, file)));
  }

  deletePhoto(photoId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/chantiers/photo/${photoId}`, {
      headers: this.getAuthHeaders(),
    });
  }

  // Contact info (footer / contact page details)
  getContactInfo(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/contact-info`);
  }

  updateContactInfo(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/contact-info`, data, {
      headers: this.getAuthHeaders(),
    });
  }

  // About info (À propos de nous page content)
  getAboutInfo(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/about-info`);
  }

  updateAboutInfo(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/about-info`, data, {
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
