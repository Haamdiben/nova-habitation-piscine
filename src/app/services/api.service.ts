import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = `${environment.backendUrl}/api`;

  constructor(private http: HttpClient) {}

  // Auth endpoints
  login(username: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, { username, password });
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

  uploadAboutPhoto(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/about-info/photo`, formData, {
      headers: this.getAuthHeaders(),
    });
  }

  // Slider images (home page slider management)
  getSlides(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/slides`);
  }

  createSlide(file: File, title: string, description: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('description', description);
    return this.http.post(`${this.apiUrl}/slides`, formData, {
      headers: this.getAuthHeaders(),
    });
  }

  updateSlide(id: number, data: { title?: string; description?: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/slides/${id}`, data, {
      headers: this.getAuthHeaders(),
    });
  }

  deleteSlide(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/slides/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }

  getSliderSettings(): Observable<{ videoId: string }> {
    return this.http.get<{ videoId: string }>(`${this.apiUrl}/slides/settings`);
  }

  updateSliderSettings(videoId: string): Observable<{ videoId: string }> {
    return this.http.put<{ videoId: string }>(
      `${this.apiUrl}/slides/settings`,
      { videoId },
      { headers: this.getAuthHeaders() },
    );
  }

  reorderSlides(ids: number[]): Observable<any[]> {
    return this.http.put<any[]>(
      `${this.apiUrl}/slides/reorder`,
      { ids },
      { headers: this.getAuthHeaders() },
    );
  }

  // Services (Nos Services / Nos domaines d'expertise — shared content)
  getServices(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/services`);
  }

  createService(data: { title: string; description: string; features: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/services`, data, {
      headers: this.getAuthHeaders(),
    });
  }

  updateService(id: number, data: { title?: string; description?: string; features?: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/services/${id}`, data, {
      headers: this.getAuthHeaders(),
    });
  }

  deleteService(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/services/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }

  reorderServices(ids: number[]): Observable<any[]> {
    return this.http.put<any[]>(
      `${this.apiUrl}/services/reorder`,
      { ids },
      { headers: this.getAuthHeaders() },
    );
  }

  // Contact messages (public form + admin inbox)
  sendContactMessage(data: {
    name: string;
    email: string;
    phone: string;
    projectType: string;
    message: string;
    consent: boolean;
    website: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/contact-messages`, data);
  }

  getContactMessages(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/contact-messages`, {
      headers: this.getAuthHeaders(),
    });
  }

  setContactMessageRead(id: number, isRead: boolean): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/contact-messages/${id}/read`,
      { isRead },
      { headers: this.getAuthHeaders() },
    );
  }

  deleteContactMessage(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/contact-messages/${id}`, {
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
