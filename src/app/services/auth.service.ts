import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  /** The admin session lives in the browser; pages rendered on the server are never logged in */
  private storage: Storage | null = isPlatformBrowser(inject(PLATFORM_ID)) ? localStorage : null;

  isAuthenticated = signal(this.hasToken());
  adminId = signal<number | null>(this.getAdminId());

  constructor(private router: Router) {}

  logout() {
    this.storage?.removeItem('token');
    this.storage?.removeItem('adminId');
    this.isAuthenticated.set(false);
    this.adminId.set(null);
    this.router.navigate(['/admin/login']);
  }

  private hasToken(): boolean {
    const token = this.storage?.getItem('token');
    if (!token) return false;
    if (this.isExpired(token)) {
      this.storage?.removeItem('token');
      this.storage?.removeItem('adminId');
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
    const id = this.storage?.getItem('adminId');
    return id ? parseInt(id, 10) : null;
  }
}
