import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { AdminSidenavComponent } from './admin-sidenav.component';

@Component({
  selector: 'app-admin-category-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, AdminSidenavComponent],
  template: `
    <div class="flex">
      <!-- Sidenav -->
      <app-admin-sidenav (onLogout)="logout()"></app-admin-sidenav>

      <!-- Main Content -->
      <div class="flex-1 md:ml-64 pt-16 md:pt-0 min-h-screen bg-gray-50">
        <!-- Header -->
        <div class="bg-white shadow">
          <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <a
              routerLink="/admin/dashboard/realisations"
              class="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-base font-semibold transition mb-4"
              style="border: 2px solid #C09453; color: #C09453;"
            >
              ← Toutes les catégories
            </a>
            <h1 class="text-2xl sm:text-3xl font-bold" style="color: #C09453;">{{ category()?.name || '...' }}</h1>
            <p class="text-gray-600 mt-2 text-sm sm:text-base">Gérez les chantiers de cette catégorie</p>
          </div>
        </div>

        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div *ngIf="loading()" class="text-center py-8">
            <p class="text-gray-600">Chargement...</p>
          </div>

          <ng-container *ngIf="!loading()">
            <!-- Add chantier button -->
            <div *ngIf="!showForm()" class="mb-6">
              <button
                (click)="showAddForm()"
                class="px-6 py-3 rounded-lg font-semibold transition"
                style="border: 2px solid #C09453; color: #C09453;"
              >
                + Ajouter un chantier
              </button>
            </div>

            <!-- Add/Edit Form -->
            <div *ngIf="showForm()" class="bg-white rounded-lg shadow-lg p-4 sm:p-8 mb-8">
              <h2 class="text-xl font-bold mb-6" style="color: #C09453;">
                {{ editingId() ? 'Modifier' : 'Ajouter' }} un chantier
              </h2>

              <form (ngSubmit)="saveChantier()" class="space-y-6">
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

            <!-- Chantiers list -->
            <div *ngIf="(category()?.chantiers || []).length === 0" class="bg-white rounded-lg shadow p-6 text-center text-gray-500">
              Aucun chantier dans cette catégorie pour le moment.
            </div>

            <div class="space-y-3">
              <div *ngFor="let chantier of category()?.chantiers" class="bg-white rounded-lg shadow overflow-hidden">
                <!-- Row Header -->
                <button
                  type="button"
                  (click)="toggleFolder(chantier.id)"
                  class="w-full flex items-center justify-between gap-3 p-4 sm:p-6 text-left hover:bg-gray-50 transition"
                >
                  <div class="flex items-center gap-3 min-w-0">
                    <img
                      *ngIf="chantier.photos && chantier.photos.length > 0"
                      [src]="getPhotoUrl(chantier.photos[0].filepath)"
                      class="w-12 h-12 rounded object-cover flex-shrink-0"
                      alt=""
                    />
                    <span *ngIf="!chantier.photos || chantier.photos.length === 0" class="w-12 h-12 rounded bg-gray-100 flex items-center justify-center text-xl flex-shrink-0">📁</span>
                    <div class="min-w-0">
                      <h3 class="text-lg font-bold text-gray-900 truncate">{{ chantier.title }}</h3>
                      <p class="text-sm text-gray-500">{{ chantier.photos?.length || 0 }} photo(s)</p>
                    </div>
                  </div>
                  <span class="text-gray-400 text-xl flex-shrink-0 transition-transform" [class.rotate-180]="isFolderOpen(chantier.id)">▾</span>
                </button>

                <!-- Expanded Content -->
                <div *ngIf="isFolderOpen(chantier.id)" class="px-4 sm:px-6 pb-6 border-t border-gray-100">
                  <div class="flex flex-col sm:flex-row sm:justify-end gap-2 pt-4 mb-4">
                    <button
                      (click)="editChantier(chantier)"
                      class="px-4 py-2 rounded text-sm font-semibold"
                      style="border: 2px solid #C09453; color: #C09453;"
                    >
                      Modifier
                    </button>
                    <button
                      (click)="deleteChantier(chantier.id)"
                      class="px-4 py-2 rounded text-sm font-semibold border-2 border-red-500 text-red-500"
                    >
                      Supprimer
                    </button>
                  </div>

                  <p class="text-gray-600 mb-6">{{ chantier.description }}</p>

                  <!-- Photos -->
                  <div class="bg-gray-50 p-4 rounded">
                    <h4 class="font-bold mb-4">Photos ({{ chantier.photos?.length || 0 }})</h4>

                    <div class="mb-4">
                      <input
                        type="file"
                        #fileInput
                        accept="image/*"
                        multiple
                        (change)="onFilesSelected($event, chantier.id)"
                        class="hidden"
                      />
                      <button
                        (click)="fileInput.click()"
                        [disabled]="uploadingPhotoId() === chantier.id"
                        class="px-4 py-2 rounded text-sm font-semibold"
                        style="border: 2px solid #C09453; color: #C09453;"
                      >
                        {{ uploadingPhotoId() === chantier.id ? 'Téléchargement...' : '📤 Ajouter des photos' }}
                      </button>
                    </div>

                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div *ngFor="let photo of chantier.photos" class="relative">
                        <img
                          [src]="getPhotoUrl(photo.filepath)"
                          [alt]="photo.filename"
                          class="w-full h-32 object-cover rounded"
                        />
                        <button
                          (click)="deletePhoto(photo.id)"
                          class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                          title="Supprimer la photo"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ng-container>
        </div>
      </div>
    </div>
  `,
})
export class AdminCategoryDetailComponent implements OnInit {
  category = signal<any | null>(null);
  loading = signal(true);
  saving = signal(false);
  uploadingPhotoId = signal<number | null>(null);
  showForm = signal(false);
  editingId = signal<number | null>(null);
  openFolderIds = signal<Set<number>>(new Set());
  categoryId!: number;

  formData = { title: '', description: '' };

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/admin/login']);
      return;
    }
    this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('id'));
      if (id) {
        this.categoryId = id;
        this.loadCategory();
      }
    });
  }

  loadCategory() {
    this.loading.set(true);
    this.apiService.getRealisation(this.categoryId).subscribe({
      next: (data) => {
        this.category.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading category:', err);
        this.loading.set(false);
      },
    });
  }

  showAddForm() {
    this.editingId.set(null);
    this.formData = { title: '', description: '' };
    this.showForm.set(true);
  }

  toggleFolder(id: number) {
    const open = new Set(this.openFolderIds());
    if (open.has(id)) {
      open.delete(id);
    } else {
      open.add(id);
    }
    this.openFolderIds.set(open);
  }

  isFolderOpen(id: number): boolean {
    return this.openFolderIds().has(id);
  }

  editChantier(chantier: any) {
    this.editingId.set(chantier.id);
    this.formData = { title: chantier.title, description: chantier.description };
    this.showForm.set(true);
  }

  cancelForm() {
    this.showForm.set(false);
    this.editingId.set(null);
  }

  saveChantier() {
    if (!this.formData.title || !this.formData.description) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    this.saving.set(true);
    const payload = {
      title: this.formData.title,
      description: this.formData.description,
      realisationId: this.categoryId,
    };

    if (this.editingId()) {
      this.apiService.updateChantier(this.editingId()!, payload).subscribe({
        next: () => {
          this.loadCategory();
          this.cancelForm();
          this.saving.set(false);
        },
        error: (err) => {
          console.error('Error updating chantier:', err);
          this.saving.set(false);
        },
      });
    } else {
      this.apiService.createChantier(payload).subscribe({
        next: () => {
          this.loadCategory();
          this.cancelForm();
          this.saving.set(false);
        },
        error: (err) => {
          console.error('Error creating chantier:', err);
          this.saving.set(false);
        },
      });
    }
  }

  deleteChantier(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce chantier ?')) {
      this.apiService.deleteChantier(id).subscribe({
        next: () => this.loadCategory(),
        error: (err) => console.error('Error deleting chantier:', err),
      });
    }
  }

  onFilesSelected(event: any, chantierId: number) {
    const files: File[] = Array.from(event.target.files || []);
    if (files.length === 0) return;

    this.uploadingPhotoId.set(chantierId);
    this.apiService.uploadPhotos(chantierId, files).subscribe({
      next: () => {
        this.loadCategory();
        this.uploadingPhotoId.set(null);
        event.target.value = '';
      },
      error: (err) => {
        console.error('Error uploading photos:', err);
        this.uploadingPhotoId.set(null);
        event.target.value = '';
      },
    });
  }

  deletePhoto(photoId: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette photo ?')) {
      this.apiService.deletePhoto(photoId).subscribe({
        next: () => this.loadCategory(),
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
