import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center px-4">
      <div class="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <h1 class="text-3xl font-bold text-center mb-2" style="color: #C09453;">ipswim Admin</h1>
        <p class="text-center text-gray-600 mb-8">Connexion à l'espace administrateur</p>

        <form (ngSubmit)="onSubmit()" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-2">Nom d'utilisateur</label>
            <input
              type="text"
              [(ngModel)]="username"
              name="username"
              class="w-full px-4 py-2 border-2 rounded-lg focus:outline-none transition"
              style="border-color: #C09453; focus:ring-color: #C09453;"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-900 mb-2">Mot de passe</label>
            <input
              type="password"
              [(ngModel)]="password"
              name="password"
              class="w-full px-4 py-2 border-2 rounded-lg focus:outline-none transition"
              style="border-color: #C09453; focus:ring-color: #C09453;"
              required
            />
          </div>

          <button
            type="submit"
            [disabled]="loading"
            class="w-full px-6 py-3 rounded-lg font-semibold transition hover:bg-opacity-90"
            style="border: 2px solid #C09453; color: #C09453; background-color: transparent;"
            [class.opacity-50]="loading"
          >
            {{ loading ? 'Connexion...' : 'Se connecter' }}
          </button>
        </form>

        <div *ngIf="error" class="mt-6 p-4 bg-red-50 border border-red-200 rounded text-red-700">
          {{ error }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `],
})
export class AdminLoginComponent {
  username = '';
  password = '';
  loading = false;
  error = '';

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router,
  ) {}

  onSubmit() {
    if (!this.username || !this.password) {
      this.error = 'Veuillez remplir tous les champs';
      return;
    }

    this.loading = true;
    this.error = '';

    this.apiService.login(this.username, this.password).subscribe({
      next: (response) => {
        localStorage.setItem('token', response.access_token);
        localStorage.setItem('adminId', response.adminId);
        this.authService.isAuthenticated.set(true);
        this.authService.adminId.set(response.adminId);
        this.router.navigate(['/admin/dashboard']);
      },
      error: (err) => {
        this.error = 'Identifiants invalides';
        this.loading = false;
      },
    });
  }
}
