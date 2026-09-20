import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminSidenavComponent } from './admin-sidenav.component';
import { FieldVisibilityBadgeComponent } from '../../components/field-visibility-badge/field-visibility-badge.component';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-slides',
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
            <h1 class="text-2xl sm:text-3xl font-bold" style="color: #C09453;">Slider Accueil</h1>
            <p class="text-gray-600 mt-2 text-sm sm:text-base">Gérez les photos affichées dans le slider de la page d'accueil</p>
          </div>
        </div>

        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <!-- Add Slide Form -->
          <div class="bg-white rounded-lg shadow p-4 sm:p-6 mb-8">
            <button
              type="button"
              (click)="toggleAddForm()"
              class="w-full flex items-center justify-between"
            >
              <h2 class="text-lg font-bold" style="color: #C09453;">+ Ajouter une photo</h2>
              <span class="text-gray-400 text-xl transition-transform" [class.rotate-180]="showAddForm()">▾</span>
            </button>

            <form *ngIf="showAddForm()" (ngSubmit)="addSlide()" class="space-y-4 mt-4">
              <div>
                <label class="flex items-center gap-2 text-sm font-medium text-gray-900 mb-2">
                  Photo
                  <app-field-visibility-badge></app-field-visibility-badge>
                </label>
                <input
                  type="file"
                  #fileInput
                  accept="image/*"
                  (change)="onFileSelected($event)"
                  class="w-full px-4 py-2 border-2 rounded-lg"
                  style="border-color: #C09453;"
                />
                <p *ngIf="selectedFileName()" class="text-xs text-gray-500 mt-1">{{ selectedFileName() }}</p>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="flex items-center gap-2 text-sm font-medium text-gray-900 mb-2">
                    Titre
                    <app-field-visibility-badge></app-field-visibility-badge>
                  </label>
                  <input
                    type="text"
                    [(ngModel)]="newSlide.title"
                    name="title"
                    placeholder="Piscine à Débordement"
                    class="w-full px-4 py-2 border-2 rounded-lg"
                    style="border-color: #C09453;"
                  />
                </div>
                <div>
                  <label class="flex items-center gap-2 text-sm font-medium text-gray-900 mb-2">
                    Description
                    <app-field-visibility-badge></app-field-visibility-badge>
                  </label>
                  <input
                    type="text"
                    [(ngModel)]="newSlide.description"
                    name="description"
                    placeholder="Luxe et technologie"
                    class="w-full px-4 py-2 border-2 rounded-lg"
                    style="border-color: #C09453;"
                  />
                </div>
              </div>

              <button
                type="submit"
                [disabled]="uploading() || !selectedFile"
                class="px-6 py-3 rounded-lg font-semibold transition"
                style="border: 2px solid #C09453; color: #C09453;"
              >
                {{ uploading() ? 'Téléchargement...' : '+ Ajouter au slider' }}
              </button>

              <div *ngIf="errorMessage()" class="p-4 bg-red-50 border border-red-200 rounded text-red-700">
                {{ errorMessage() }}
              </div>
            </form>
          </div>

          <!-- Slides List -->
          <div>
            <h2 class="text-lg font-bold mb-4" style="color: #C09453;">Photos actuelles ({{ slides().length }})</h2>

            <div *ngIf="loading()" class="text-center py-8">
              <p class="text-gray-600">Chargement...</p>
            </div>

            <div *ngIf="!loading() && slides().length === 0" class="bg-white rounded-lg shadow p-6 text-center text-gray-500">
              Aucune photo dans le slider pour le moment.
            </div>

            <div *ngIf="!loading() && slides().length > 0" class="space-y-3">
              <div *ngFor="let slide of slides(); let i = index" class="bg-white rounded-lg shadow p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <img [src]="getPhotoUrl(slide.filepath)" [alt]="slide.title" class="w-full sm:w-32 h-32 object-cover rounded-lg flex-shrink-0" />

                <div class="flex-1 min-w-0 w-full">
                  <div *ngIf="editingId() !== slide.id">
                    <h3 class="font-bold text-gray-900">{{ slide.title || '(Sans titre)' }}</h3>
                    <p class="text-sm text-gray-500">{{ slide.description }}</p>
                  </div>

                  <div *ngIf="editingId() === slide.id" class="space-y-2">
                    <input
                      type="text"
                      [(ngModel)]="editData.title"
                      name="editTitle"
                      placeholder="Titre"
                      class="w-full px-3 py-1.5 border-2 rounded text-sm"
                      style="border-color: #C09453;"
                    />
                    <input
                      type="text"
                      [(ngModel)]="editData.description"
                      name="editDescription"
                      placeholder="Description"
                      class="w-full px-3 py-1.5 border-2 rounded text-sm"
                      style="border-color: #C09453;"
                    />
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
                    [disabled]="i === slides().length - 1"
                    class="w-9 h-9 rounded border-2 flex items-center justify-center disabled:opacity-30"
                    style="border-color: #C09453; color: #C09453;"
                    title="Descendre"
                  >
                    ↓
                  </button>
                </div>

                <div class="flex flex-row sm:flex-col gap-2 flex-shrink-0">
                  <ng-container *ngIf="editingId() !== slide.id">
                    <button
                      (click)="startEdit(slide)"
                      class="px-3 py-2 rounded text-sm font-semibold"
                      style="border: 2px solid #C09453; color: #C09453;"
                    >
                      Modifier
                    </button>
                    <button
                      (click)="deleteSlide(slide.id)"
                      class="px-3 py-2 rounded text-sm font-semibold border-2 border-red-500 text-red-500"
                    >
                      Supprimer
                    </button>
                  </ng-container>
                  <ng-container *ngIf="editingId() === slide.id">
                    <button
                      (click)="saveEdit(slide.id)"
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
  `,
})
export class AdminSlidesComponent implements OnInit {
  loading = signal(true);
  uploading = signal(false);
  errorMessage = signal('');
  slides = signal<any[]>([]);
  showAddForm = signal(false);
  selectedFile: File | null = null;
  selectedFileName = signal('');

  editingId = signal<number | null>(null);
  editData = { title: '', description: '' };

  newSlide = { title: '', description: '' };

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.loadSlides();
  }

  loadSlides() {
    this.loading.set(true);
    this.apiService.getSlides().subscribe({
      next: (data) => {
        this.slides.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading slides:', err);
        this.loading.set(false);
      },
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.selectedFileName.set(file.name);
    }
  }

  toggleAddForm() {
    this.showAddForm.set(!this.showAddForm());
  }

  addSlide() {
    if (!this.selectedFile) {
      this.errorMessage.set('Veuillez sélectionner une photo.');
      return;
    }

    this.uploading.set(true);
    this.errorMessage.set('');

    this.apiService.createSlide(this.selectedFile, this.newSlide.title, this.newSlide.description).subscribe({
      next: () => {
        this.uploading.set(false);
        this.selectedFile = null;
        this.selectedFileName.set('');
        this.newSlide = { title: '', description: '' };
        this.showAddForm.set(false);
        this.loadSlides();
      },
      error: (err) => {
        console.error('Error creating slide:', err);
        this.uploading.set(false);
        this.errorMessage.set("Erreur lors de l'ajout de la photo.");
      },
    });
  }

  startEdit(slide: any) {
    this.editingId.set(slide.id);
    this.editData = { title: slide.title || '', description: slide.description || '' };
  }

  cancelEdit() {
    this.editingId.set(null);
  }

  saveEdit(id: number) {
    this.apiService.updateSlide(id, this.editData).subscribe({
      next: () => {
        this.editingId.set(null);
        this.loadSlides();
      },
      error: (err) => console.error('Error updating slide:', err),
    });
  }

  deleteSlide(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette photo du slider ?')) {
      this.apiService.deleteSlide(id).subscribe({
        next: () => this.loadSlides(),
        error: (err) => console.error('Error deleting slide:', err),
      });
    }
  }

  moveUp(index: number) {
    if (index === 0) return;
    const arr = [...this.slides()];
    [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
    this.slides.set(arr);
    this.persistOrder();
  }

  moveDown(index: number) {
    if (index === this.slides().length - 1) return;
    const arr = [...this.slides()];
    [arr[index + 1], arr[index]] = [arr[index], arr[index + 1]];
    this.slides.set(arr);
    this.persistOrder();
  }

  private persistOrder() {
    const ids = this.slides().map((s) => s.id);
    this.apiService.reorderSlides(ids).subscribe({
      error: (err) => console.error('Error reordering slides:', err),
    });
  }

  getPhotoUrl(filepath: string): string {
    return `http://localhost:3000/${filepath}`;
  }

  logout() {
    this.authService.logout();
  }
}
