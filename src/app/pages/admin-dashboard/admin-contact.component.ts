import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminSidenavComponent } from './admin-sidenav.component';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminSidenavComponent],
  template: `
    <div class="flex">
      <!-- Sidenav -->
      <app-admin-sidenav (onLogout)="logout()"></app-admin-sidenav>

      <!-- Main Content -->
      <div class="flex-1 md:ml-64 pt-16 md:pt-0 min-h-screen bg-gray-50">
        <!-- Header -->
        <div class="bg-white shadow">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h1 class="text-2xl sm:text-3xl font-bold" style="color: #C09453;">Informations de Contact</h1>
            <p class="text-gray-600 mt-2 text-sm sm:text-base">Mettez à jour les informations de contact de votre entreprise</p>
          </div>
        </div>

        <!-- Content -->
        <div class="max-w-4xl mx-auto px-4 py-8">
          <div *ngIf="loading()" class="text-center py-8">
            <p class="text-gray-600">Chargement...</p>
          </div>

          <div *ngIf="!loading()" class="bg-white rounded-lg shadow p-4 sm:p-8">
            <form (ngSubmit)="saveContact()" class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-900 mb-2">Téléphone</label>
                  <input
                    type="tel"
                    [(ngModel)]="contactData.phone"
                    name="phone"
                    class="w-full px-4 py-2 border-2 rounded-lg"
                    style="border-color: #C09453;"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-900 mb-2">Email</label>
                  <input
                    type="email"
                    [(ngModel)]="contactData.email"
                    name="email"
                    class="w-full px-4 py-2 border-2 rounded-lg"
                    style="border-color: #C09453;"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-900 mb-2">Adresse</label>
                <input
                  type="text"
                  [(ngModel)]="contactData.address"
                  name="address"
                  class="w-full px-4 py-2 border-2 rounded-lg"
                  style="border-color: #C09453;"
                />
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-900 mb-2">Ville</label>
                  <input
                    type="text"
                    [(ngModel)]="contactData.city"
                    name="city"
                    class="w-full px-4 py-2 border-2 rounded-lg"
                    style="border-color: #C09453;"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-900 mb-2">Code Postal</label>
                  <input
                    type="text"
                    [(ngModel)]="contactData.postalCode"
                    name="postalCode"
                    class="w-full px-4 py-2 border-2 rounded-lg"
                    style="border-color: #C09453;"
                  />
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-900 mb-2">SIREN</label>
                  <input
                    type="text"
                    [(ngModel)]="contactData.siren"
                    name="siren"
                    class="w-full px-4 py-2 border-2 rounded-lg"
                    style="border-color: #C09453;"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-900 mb-2">SIRET</label>
                  <input
                    type="text"
                    [(ngModel)]="contactData.siret"
                    name="siret"
                    class="w-full px-4 py-2 border-2 rounded-lg"
                    style="border-color: #C09453;"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-900 mb-2">Horaires d'ouverture</label>
                <textarea
                  [(ngModel)]="contactData.hours"
                  name="hours"
                  rows="4"
                  class="w-full px-4 py-2 border-2 rounded-lg"
                  style="border-color: #C09453;"
                  placeholder="Lundi - Vendredi: 8h00 - 18h00&#10;Samedi: 9h00 - 13h00&#10;Dimanche: Fermé"
                ></textarea>
              </div>

              <div class="flex gap-4">
                <button
                  type="submit"
                  [disabled]="saving()"
                  class="px-6 py-3 rounded-lg font-semibold transition"
                  style="border: 2px solid #C09453; color: #C09453;"
                >
                  {{ saving() ? 'Enregistrement...' : 'Enregistrer' }}
                </button>
              </div>

              <div *ngIf="successMessage()" class="p-4 bg-green-50 border border-green-200 rounded text-green-700">
                {{ successMessage() }}
              </div>
              <div *ngIf="errorMessage()" class="p-4 bg-red-50 border border-red-200 rounded text-red-700">
                {{ errorMessage() }}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AdminContactComponent implements OnInit {
  loading = signal(true);
  saving = signal(false);
  successMessage = signal('');
  errorMessage = signal('');

  contactData = {
    phone: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    siren: '',
    siret: '',
    hours: '',
  };

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.apiService.getContactInfo().subscribe({
      next: (data) => {
        this.contactData = {
          phone: data.phone || '',
          email: data.email || '',
          address: data.address || '',
          city: data.city || '',
          postalCode: data.postalCode || '',
          siren: data.siren || '',
          siret: data.siret || '',
          hours: data.hours || '',
        };
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading contact info:', err);
        this.loading.set(false);
      },
    });
  }

  saveContact() {
    this.saving.set(true);
    this.errorMessage.set('');

    this.apiService.updateContactInfo(this.contactData).subscribe({
      next: () => {
        this.saving.set(false);
        this.successMessage.set('✅ Informations de contact enregistrées avec succès!');
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (err) => {
        console.error('Error saving contact info:', err);
        this.saving.set(false);
        this.errorMessage.set('❌ Erreur lors de l\'enregistrement. Vérifiez que vous êtes bien connecté.');
      },
    });
  }

  logout() {
    this.authService.logout();
  }
}
