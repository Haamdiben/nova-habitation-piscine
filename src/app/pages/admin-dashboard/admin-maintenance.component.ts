import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, DEFAULT_MAINTENANCE_MESSAGE } from '../../services/api.service';

@Component({
  selector: 'app-admin-maintenance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Header -->
    <div class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 class="text-2xl sm:text-3xl font-bold" style="color: #C09453;">Maintenance</h1>
        <p class="text-gray-600 mt-2 text-sm sm:text-base">
          Remplacez tout le site public par une page « Nous revenons très vite » avec vos coordonnées. L'administration reste accessible.
        </p>
      </div>
    </div>

    <!-- Content -->
    <div class="max-w-4xl mx-auto px-4 py-8">
      <div *ngIf="loading()" class="text-center py-8">
        <p class="text-gray-600">Chargement...</p>
      </div>

      <div *ngIf="!loading()" class="bg-white rounded-lg shadow p-4 sm:p-8 space-y-6">
        <!-- Current state -->
        <div
          class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border-2"
          [class.border-orange-400]="savedMaintenance()"
          [class.bg-orange-50]="savedMaintenance()"
          [class.border-green-400]="!savedMaintenance()"
          [class.bg-green-50]="!savedMaintenance()"
        >
          <div>
            <p class="font-bold text-gray-900">
              {{ savedMaintenance() ? '🚧 Le site est en maintenance' : '✅ Le site est en ligne' }}
            </p>
            <p class="text-sm text-gray-600 mt-1">
              {{ savedMaintenance() ? 'Les visiteurs voient uniquement la page de maintenance.' : 'Les visiteurs voient le site normalement.' }}
            </p>
          </div>
          <button
            type="button"
            (click)="toggle()"
            [disabled]="saving()"
            class="px-6 py-3 rounded-lg font-semibold transition whitespace-nowrap"
            style="border: 2px solid #C09453; color: #C09453;"
          >
            {{ saving() ? 'Enregistrement...' : savedMaintenance() ? 'Remettre le site en ligne' : 'Activer la maintenance' }}
          </button>
        </div>

        <!-- Message -->
        <form (ngSubmit)="saveMessage()" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-2">Message affiché sur la page de maintenance</label>
            <textarea
              [(ngModel)]="message"
              name="message"
              rows="3"
              maxlength="1000"
              class="w-full px-4 py-2 border-2 rounded-lg"
              style="border-color: #C09453;"
              [placeholder]="defaultMessage"
            ></textarea>
            <p class="text-xs text-gray-500 mt-1">
              Laissez vide pour le texte par défaut. Le nom du gérant, le téléphone, l'email et l'adresse viennent de « Nos coordonnées ».
            </p>
          </div>
          <button
            type="submit"
            [disabled]="saving()"
            class="px-6 py-3 rounded-lg font-semibold transition"
            style="border: 2px solid #C09453; color: #C09453;"
          >
            Enregistrer le message
          </button>
        </form>

        <div *ngIf="successMessage()" class="p-4 bg-green-50 border border-green-200 rounded text-green-700">
          {{ successMessage() }}
        </div>
        <div *ngIf="errorMessage()" class="p-4 bg-red-50 border border-red-200 rounded text-red-700">
          {{ errorMessage() }}
        </div>
      </div>
    </div>
  `,
})
export class AdminMaintenanceComponent implements OnInit {
  readonly defaultMessage = DEFAULT_MAINTENANCE_MESSAGE;

  loading = signal(true);
  saving = signal(false);
  successMessage = signal('');
  errorMessage = signal('');

  savedMaintenance = signal(false);
  message = '';

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.apiService.getSiteSettings().subscribe({
      next: (settings) => {
        this.savedMaintenance.set(settings.maintenance);
        this.message = settings.maintenanceMessage;
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading site settings:', err);
        this.loading.set(false);
      },
    });
  }

  toggle() {
    const maintenance = !this.savedMaintenance();
    this.save({ maintenance }, maintenance ? '🚧 Maintenance activée : les visiteurs voient la page de maintenance.' : '✅ Le site est de nouveau en ligne.');
  }

  saveMessage() {
    this.save({ maintenanceMessage: this.message }, '✅ Message enregistré.');
  }

  private save(data: { maintenance?: boolean; maintenanceMessage?: string }, success: string) {
    this.saving.set(true);
    this.errorMessage.set('');
    this.apiService.updateSiteSettings(data).subscribe({
      next: (settings) => {
        this.saving.set(false);
        this.savedMaintenance.set(settings.maintenance);
        this.successMessage.set(success);
        setTimeout(() => this.successMessage.set(''), 4000);
      },
      error: (err) => {
        console.error('Error saving site settings:', err);
        this.saving.set(false);
        this.errorMessage.set('❌ Erreur lors de l\'enregistrement. Vérifiez que vous êtes bien connecté.');
      },
    });
  }
}
