import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminSidenavComponent } from './admin-sidenav.component';
import { AuthService } from '../../services/auth.service';
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
          <div class="bg-white rounded-lg shadow p-4 sm:p-8">
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
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AdminContactComponent {
  saving = signal(false);
  successMessage = signal('');

  contactData = {
    phone: '+33 6 12 34 56 78',
    email: 'contact@ipswim.fr',
    address: 'Toulouse, Occitanie',
    city: 'Toulouse',
    postalCode: '31000',
    siren: '123 456 789',
    siret: '123 456 789 00012',
    hours: 'Lundi - Vendredi: 8h00 - 18h00\nSamedi: 9h00 - 13h00\nDimanche: Fermé',
  };

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  saveContact() {
    this.saving.set(true);
    // Save to localStorage for demo
    localStorage.setItem('contactInfo', JSON.stringify(this.contactData));

    setTimeout(() => {
      this.saving.set(false);
      this.successMessage.set('✅ Informations de contact enregistrées avec succès!');
      setTimeout(() => this.successMessage.set(''), 3000);
    }, 500);
  }

  logout() {
    this.authService.logout();
  }
}
