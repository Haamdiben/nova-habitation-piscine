import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { AdminSidenavComponent } from './admin-sidenav.component';

@Component({
  selector: 'app-admin-dashboard',
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
            <h1 class="text-2xl sm:text-3xl font-bold" style="color: #C09453;">Réalisations</h1>
            <p class="text-gray-600 mt-2 text-sm sm:text-base">Gérez vos projets et téléchargez des photos</p>
          </div>
        </div>

        <!-- Main Content -->
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Add New Realisation Button -->
        <div class="mb-8">
          <button
            (click)="showAddForm()"
            class="px-6 py-3 rounded-lg font-semibold transition"
            style="border: 2px solid #C09453; color: #C09453;"
          >
            + Ajouter une nouvelle réalisation
          </button>
        </div>

        <!-- Add/Edit Form -->
        <div *ngIf="showForm()" class="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 class="text-2xl font-bold mb-6" style="color: #C09453;">
            {{ editingId() ? 'Modifier' : 'Ajouter' }} une réalisation
          </h2>

          <form (ngSubmit)="saveRealisation()" class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-900 mb-2">Titre</label>
              <input
                type="text"
                [(ngModel)]="formData.title"
                name="title"
                class="w-full px-4 py-2 border-2 rounded-lg"
                style="border-color: #C09453;"
                required
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-900 mb-2">Description</label>
              <textarea
                [(ngModel)]="formData.description"
                name="description"
                rows="5"
                class="w-full px-4 py-2 border-2 rounded-lg"
                style="border-color: #C09453;"
                required
              ></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-900 mb-2">Catégorie</label>
              <select
                [(ngModel)]="formData.category"
                name="category"
                class="w-full px-4 py-2 border-2 rounded-lg"
                style="border-color: #C09453;"
                required
              >
                <option value="">Sélectionnez une catégorie</option>
                <option value="Piscines">Piscines</option>
                <option value="Rénovations de bâtiments">Rénovations de bâtiments</option>
                <option value="Peinture et finitions">Peinture et finitions</option>
              </select>
            </div>

            <div class="flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                [disabled]="saving()"
                class="px-6 py-3 rounded-lg font-semibold transition"
                style="border: 2px solid #C09453; color: #C09453;"
              >
                {{ saving() ? 'Enregistrement...' : 'Enregistrer' }}
              </button>
              <button
                type="button"
                (click)="cancelForm()"
                class="px-6 py-3 rounded-lg font-semibold border-2 border-gray-400 text-gray-600 transition hover:bg-gray-100"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>

        <!-- Realisations List -->
        <div class="space-y-4">
          <h2 class="text-2xl font-bold" style="color: #C09453;">Réalisations</h2>

          <div *ngIf="loading()" class="text-center py-8">
            <p class="text-gray-600">Chargement...</p>
          </div>

          <div *ngFor="let realisation of realisations()" class="bg-white rounded-lg shadow p-4 sm:p-6">
            <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
              <div>
                <h3 class="text-xl font-bold text-gray-900">{{ realisation.title }}</h3>
                <p class="text-sm text-gray-500">{{ realisation.category }}</p>
              </div>
              <div class="flex gap-2">
                <button
                  (click)="editRealisation(realisation)"
                  class="px-4 py-2 rounded text-sm font-semibold"
                  style="border: 2px solid #C09453; color: #C09453;"
                >
                  Modifier
                </button>
                <button
                  (click)="deleteRealisation(realisation.id)"
                  class="px-4 py-2 rounded text-sm font-semibold border-2 border-red-500 text-red-500"
                >
                  Supprimer
                </button>
              </div>
            </div>

            <p class="text-gray-600 mb-6">{{ realisation.description }}</p>

            <!-- Photos Section -->
            <div class="bg-gray-50 p-4 rounded">
              <h4 class="font-bold mb-4">Photos ({{ realisation.photos?.length || 0 }})</h4>

              <!-- Upload Photo -->
              <div class="mb-4">
                <input
                  type="file"
                  #fileInput
                  accept="image/*"
                  (change)="onFileSelected($event, realisation.id)"
                  class="hidden"
                />
                <button
                  (click)="fileInput.click()"
                  [disabled]="uploadingPhotoId() === realisation.id"
                  class="px-4 py-2 rounded text-sm font-semibold"
                  style="border: 2px solid #C09453; color: #C09453;"
                >
                  {{ uploadingPhotoId() === realisation.id ? 'Téléchargement...' : '📤 Ajouter une photo' }}
                </button>
              </div>

              <!-- Photos Grid -->
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div *ngFor="let photo of realisation.photos" class="relative">
                  <img
                    [src]="getPhotoUrl(photo.filepath)"
                    [alt]="photo.filename"
                    class="w-full h-32 object-cover rounded"
                  />
                  <button
                    (click)="deletePhoto(photo.id)"
                    class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          </div>
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
export class AdminDashboardComponent implements OnInit {
  realisations = signal<any[]>([]);
  loading = signal(false);
  saving = signal(false);
  uploadingPhotoId = signal<number | null>(null);
  showForm = signal(false);
  editingId = signal<number | null>(null);

  formData = {
    title: '',
    description: '',
    category: '',
  };

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/admin/login']);
      return;
    }
    this.loadRealisations();
  }

  loadRealisations() {
    this.loading.set(true);
    this.apiService.getRealisations().subscribe({
      next: (data) => {
        this.realisations.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading realisations:', err);
        this.loading.set(false);
      },
    });
  }

  showAddForm() {
    this.editingId.set(null);
    this.formData = { title: '', description: '', category: '' };
    this.showForm.set(true);
  }

  editRealisation(realisation: any) {
    this.editingId.set(realisation.id);
    this.formData = {
      title: realisation.title,
      description: realisation.description,
      category: realisation.category,
    };
    this.showForm.set(true);
  }

  cancelForm() {
    this.showForm.set(false);
    this.editingId.set(null);
  }

  saveRealisation() {
    if (!this.formData.title || !this.formData.description || !this.formData.category) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    this.saving.set(true);

    if (this.editingId()) {
      this.apiService.updateRealisation(this.editingId()!, this.formData).subscribe({
        next: () => {
          this.loadRealisations();
          this.cancelForm();
          this.saving.set(false);
        },
        error: (err) => {
          console.error('Error updating realisation:', err);
          this.saving.set(false);
        },
      });
    } else {
      this.apiService.createRealisation(this.formData).subscribe({
        next: () => {
          this.loadRealisations();
          this.cancelForm();
          this.saving.set(false);
        },
        error: (err) => {
          console.error('Error creating realisation:', err);
          this.saving.set(false);
        },
      });
    }
  }

  deleteRealisation(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette réalisation ?')) {
      this.apiService.deleteRealisation(id).subscribe({
        next: () => this.loadRealisations(),
        error: (err) => console.error('Error deleting realisation:', err),
      });
    }
  }

  onFileSelected(event: any, realisationId: number) {
    const file = event.target.files[0];
    if (file) {
      this.uploadingPhotoId.set(realisationId);
      this.apiService.uploadPhoto(realisationId, file).subscribe({
        next: () => {
          this.loadRealisations();
          this.uploadingPhotoId.set(null);
        },
        error: (err) => {
          console.error('Error uploading photo:', err);
          this.uploadingPhotoId.set(null);
        },
      });
    }
  }

  deletePhoto(photoId: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette photo ?')) {
      this.apiService.deletePhoto(photoId).subscribe({
        next: () => this.loadRealisations(),
        error: (err) => console.error('Error deleting photo:', err),
      });
    }
  }

  getPhotoUrl(filepath: string): string {
    return `http://localhost:3000/${filepath}`;
  }

  logout() {
    this.authService.logout();
  }
}
