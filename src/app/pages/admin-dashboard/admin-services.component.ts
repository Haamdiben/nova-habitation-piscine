import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminSidenavComponent } from './admin-sidenav.component';
import { FieldVisibilityBadgeComponent } from '../../components/field-visibility-badge/field-visibility-badge.component';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-services',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminSidenavComponent, FieldVisibilityBadgeComponent],
  template: `
    <div class="flex">
      <!-- Sidenav -->
      <app-admin-sidenav (onLogout)="logout()"></app-admin-sidenav>

      <!-- Main Content -->
      <div class="flex-1 md:ml-64 pt-16 md:pt-0 min-h-screen bg-gray-50">
        <!-- Header -->
        <div class="bg-white shadow">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h1 class="text-2xl sm:text-3xl font-bold" style="color: #C09453;">Nos Services</h1>
            <p class="text-gray-600 mt-2 text-sm sm:text-base">
              Ce contenu est partagé entre la section "Nos Services" de l'accueil et "Nos domaines d'expertise" de la page À propos.
            </p>
          </div>
        </div>

        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <!-- Add Service Form -->
          <div class="bg-white rounded-lg shadow p-4 sm:p-6 mb-8">
            <button
              type="button"
              (click)="toggleAddForm()"
              class="w-full flex items-center justify-between"
            >
              <h2 class="text-lg font-bold" style="color: #C09453;">+ Ajouter un service</h2>
              <span class="text-gray-400 text-xl transition-transform" [class.rotate-180]="showAddForm()">▾</span>
            </button>

            <form *ngIf="showAddForm()" (ngSubmit)="addService()" class="space-y-4 mt-4">
              <div>
                <label class="flex items-center gap-2 text-sm font-medium text-gray-900 mb-2">
                  Titre
                  <app-field-visibility-badge></app-field-visibility-badge>
                </label>
                <input
                  type="text"
                  [(ngModel)]="newService.title"
                  name="title"
                  placeholder="Piscines"
                  class="w-full px-4 py-2 border-2 rounded-lg"
                  style="border-color: #C09453;"
                />
              </div>

              <div>
                <label class="flex items-center gap-2 text-sm font-medium text-gray-900 mb-2">
                  Description
                  <app-field-visibility-badge></app-field-visibility-badge>
                </label>
                <textarea
                  [(ngModel)]="newService.description"
                  name="description"
                  rows="2"
                  placeholder="Construction et rénovation de piscines en béton personnalisées..."
                  class="w-full px-4 py-2 border-2 rounded-lg"
                  style="border-color: #C09453;"
                ></textarea>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-900 mb-2">
                  Points clés (un par ligne — affichés uniquement sur "À propos")
                </label>
                <textarea
                  [(ngModel)]="newService.features"
                  name="features"
                  rows="4"
                  placeholder="Piscines contemporaines&#10;Piscines miroir et débordement&#10;Rénovation complète"
                  class="w-full px-4 py-2 border-2 rounded-lg"
                  style="border-color: #C09453;"
                ></textarea>
              </div>

              <button
                type="submit"
                [disabled]="saving()"
                class="px-6 py-3 rounded-lg font-semibold transition"
                style="border: 2px solid #C09453; color: #C09453;"
              >
                {{ saving() ? 'Ajout...' : '+ Ajouter le service' }}
              </button>
            </form>
          </div>

          <!-- Services List -->
          <div>
            <h2 class="text-lg font-bold mb-4" style="color: #C09453;">Services actuels ({{ services().length }})</h2>

            <div *ngIf="loading()" class="text-center py-8">
              <p class="text-gray-600">Chargement...</p>
            </div>

            <div *ngIf="!loading() && services().length === 0" class="bg-white rounded-lg shadow p-6 text-center text-gray-500">
              Aucun service pour le moment.
            </div>

            <div *ngIf="!loading() && services().length > 0" class="space-y-3">
              <div *ngFor="let service of services(); let i = index" class="bg-white rounded-lg shadow p-4 sm:p-6">
                <div class="flex flex-col sm:flex-row gap-4">
                  <div class="flex-1 min-w-0">
                    <div *ngIf="editingId() !== service.id">
                      <div class="flex flex-wrap items-center gap-2">
                        <h3 class="font-bold text-gray-900 text-lg">{{ service.title }}</h3>
                        <app-field-visibility-badge text="titre + description visibles sur l'accueil"></app-field-visibility-badge>
                      </div>
                      <p class="text-sm text-gray-600 mt-1">{{ service.description }}</p>
                      <ul *ngIf="service.features" class="text-sm text-gray-500 mt-2 space-y-1">
                        <li *ngFor="let feature of splitFeatures(service.features)">✓ {{ feature }}</li>
                      </ul>
                      <app-field-visibility-badge
                        *ngIf="service.features"
                        variant="other"
                        text='points clés visibles uniquement sur "À propos"'
                        class="block mt-2"
                      ></app-field-visibility-badge>
                    </div>

                    <div *ngIf="editingId() === service.id" class="space-y-2">
                      <label class="flex items-center gap-2 text-xs font-semibold text-gray-500">
                        Titre <app-field-visibility-badge></app-field-visibility-badge>
                      </label>
                      <input
                        type="text"
                        [(ngModel)]="editData.title"
                        name="editTitle"
                        placeholder="Titre"
                        class="w-full px-3 py-1.5 border-2 rounded text-sm"
                        style="border-color: #C09453;"
                      />
                      <label class="flex items-center gap-2 text-xs font-semibold text-gray-500">
                        Description <app-field-visibility-badge></app-field-visibility-badge>
                      </label>
                      <textarea
                        [(ngModel)]="editData.description"
                        name="editDescription"
                        rows="2"
                        placeholder="Description"
                        class="w-full px-3 py-1.5 border-2 rounded text-sm"
                        style="border-color: #C09453;"
                      ></textarea>
                      <label class="flex items-center gap-2 text-xs font-semibold text-gray-500">
                        Points clés <app-field-visibility-badge variant="other" text='visible uniquement sur "À propos"'></app-field-visibility-badge>
                      </label>
                      <textarea
                        [(ngModel)]="editData.features"
                        name="editFeatures"
                        rows="4"
                        placeholder="Points clés (un par ligne)"
                        class="w-full px-3 py-1.5 border-2 rounded text-sm"
                        style="border-color: #C09453;"
                      ></textarea>
                    </div>
                  </div>

                  <div class="flex flex-row sm:flex-col gap-2 flex-shrink-0">
                    <button
                      (click)="moveUp(i)"
                      [disabled]="i === 0"
                      class="w-9 h-9 rounded border-2 flex items-center justify-center disabled:opacity-30"
                      style="border-color: #C09453; color: #C09453;"
                      title="Monter"
                    >
                      ↑
                    </button>
                    <button
                      (click)="moveDown(i)"
                      [disabled]="i === services().length - 1"
                      class="w-9 h-9 rounded border-2 flex items-center justify-center disabled:opacity-30"
                      style="border-color: #C09453; color: #C09453;"
                      title="Descendre"
                    >
                      ↓
                    </button>
                  </div>

                  <div class="flex flex-row sm:flex-col gap-2 flex-shrink-0">
                    <ng-container *ngIf="editingId() !== service.id">
                      <button
                        (click)="startEdit(service)"
                        class="px-3 py-2 rounded text-sm font-semibold"
                        style="border: 2px solid #C09453; color: #C09453;"
                      >
                        Modifier
                      </button>
                      <button
                        (click)="deleteService(service.id)"
                        class="px-3 py-2 rounded text-sm font-semibold border-2 border-red-500 text-red-500"
                      >
                        Supprimer
                      </button>
                    </ng-container>
                    <ng-container *ngIf="editingId() === service.id">
                      <button
                        (click)="saveEdit(service.id)"
                        class="px-3 py-2 rounded text-sm font-semibold"
                        style="border: 2px solid #C09453; color: #C09453;"
                      >
                        Enregistrer
                      </button>
                      <button
                        (click)="cancelEdit()"
                        class="px-3 py-2 rounded text-sm font-semibold border-2 border-gray-400 text-gray-600"
                      >
                        Annuler
                      </button>
                    </ng-container>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AdminServicesComponent implements OnInit {
  loading = signal(true);
  saving = signal(false);
  services = signal<any[]>([]);
  showAddForm = signal(false);

  editingId = signal<number | null>(null);
  editData = { title: '', description: '', features: '' };

  newService = { title: '', description: '', features: '' };

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.loadServices();
  }

  loadServices() {
    this.loading.set(true);
    this.apiService.getServices().subscribe({
      next: (data) => {
        this.services.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading services:', err);
        this.loading.set(false);
      },
    });
  }

  splitFeatures(features: string): string[] {
    return (features || '').split('\n').map((f) => f.trim()).filter((f) => f.length > 0);
  }

  toggleAddForm() {
    this.showAddForm.set(!this.showAddForm());
  }

  addService() {
    if (!this.newService.title.trim()) {
      alert('Veuillez entrer un titre.');
      return;
    }

    this.saving.set(true);
    this.apiService.createService(this.newService).subscribe({
      next: () => {
        this.saving.set(false);
        this.newService = { title: '', description: '', features: '' };
        this.showAddForm.set(false);
        this.loadServices();
      },
      error: (err) => {
        console.error('Error creating service:', err);
        this.saving.set(false);
      },
    });
  }

  startEdit(service: any) {
    this.editingId.set(service.id);
    this.editData = {
      title: service.title || '',
      description: service.description || '',
      features: service.features || '',
    };
  }

  cancelEdit() {
    this.editingId.set(null);
  }

  saveEdit(id: number) {
    this.apiService.updateService(id, this.editData).subscribe({
      next: () => {
        this.editingId.set(null);
        this.loadServices();
      },
      error: (err) => console.error('Error updating service:', err),
    });
  }

  deleteService(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) {
      this.apiService.deleteService(id).subscribe({
        next: () => this.loadServices(),
        error: (err) => console.error('Error deleting service:', err),
      });
    }
  }

  moveUp(index: number) {
    if (index === 0) return;
    const arr = [...this.services()];
    [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
    this.services.set(arr);
    this.persistOrder();
  }

  moveDown(index: number) {
    if (index === this.services().length - 1) return;
    const arr = [...this.services()];
    [arr[index + 1], arr[index]] = [arr[index], arr[index + 1]];
    this.services.set(arr);
    this.persistOrder();
  }

  private persistOrder() {
    const ids = this.services().map((s) => s.id);
    this.apiService.reorderServices(ids).subscribe({
      error: (err) => console.error('Error reordering services:', err),
    });
  }

  logout() {
    this.authService.logout();
  }
}
