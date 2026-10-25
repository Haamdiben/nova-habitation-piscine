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
    const token = localStorage.getItem('token');
    if (!token) return false;
    if (this.isExpired(token)) {
      localStorage.removeItem('token');
      localStorage.removeItem('adminId');
      return false;
    }
    return true;
  }

  /** Reads the JWT's `exp` claim; the server still verifies the signature. */
  private isExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      return typeof payload.exp === 'number' && payload.exp * 1000 <= Date.now();
    } catch {
      return true;
    }
  }

  private getAdminId(): number | null {
    const id = localStorage.getItem('adminId');
    return id ? parseInt(id, 10) : null;
  }
}
