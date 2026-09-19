import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  isAuthenticated = signal(this.hasToken());
  adminId = signal<number | null>(this.getAdminId());

  constructor(private router: Router) {}

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('adminId');
    this.isAuthenticated.set(false);
    this.adminId.set(null);
    this.router.navigate(['/admin/login']);
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('token');
  }

  private getAdminId(): number | null {
    const id = localStorage.getItem('adminId');
    return id ? parseInt(id, 10) : null;
  }
}
