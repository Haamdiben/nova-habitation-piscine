import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FieldVisibilityBadgeComponent } from '../../components/field-visibility-badge/field-visibility-badge.component';
import { ApiService } from '../../services/api.service';
import { uploadUrl } from '../../utils/upload-url';
import { parseYouTubeId, youTubeThumbnail } from '../../utils/youtube-api';

@Component({
  selector: 'app-admin-slides',
  standalone: true,
  imports: [CommonModule, FormsModule, FieldVisibilityBadgeComponent],
  template: `
    <!-- Header -->
    <div class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 class="text-2xl sm:text-3xl font-bold" style="color: #C09453;">Slider Accueil</h1>
        <p class="text-gray-600 mt-2 text-sm sm:text-base">Gérez la vidéo et les photos affichées dans le slider de la page d'accueil</p>
      </div>
    </div>

    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <!-- Opening Video -->
          <div class="bg-white rounded-lg shadow p-4 sm:p-6 mb-8">
            <h2 class="flex items-center gap-2 text-lg font-bold" style="color: #C09453;">
              Vidéo d'ouverture
              <app-field-visibility-badge></app-field-visibility-badge>
            </h2>
            <p class="text-sm text-gray-500 mt-1">
              Vidéo YouTube jouée en premier (sans le son), avant les photos. Laissez vide pour n'afficher que les photos.
            </p>

            <form (ngSubmit)="saveVideo()" class="mt-4 flex flex-col sm:flex-row gap-4 items-start">
              <div class="w-full sm:w-48 aspect-video rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                <img *ngIf="videoPreviewId()" [src]="thumbnail(videoPreviewId()!)" alt="Aperçu de la vidéo" class="w-full h-full object-cover" />
                <span *ngIf="!videoPreviewId()" class="text-xs text-gray-400 px-2 text-center">Aucune vidéo</span>
              </div>

              <div class="flex-1 w-full space-y-3">
                <input
                  type="text"
                  [ngModel]="videoInput()"
                  (ngModelChange)="onVideoInput($event)"
                  name="videoUrl"
                  placeholder="https://www.youtube.com/watch?v=..."
                  class="w-full px-4 py-2 border-2 rounded-lg"
                  style="border-color: #C09453;"
                />
                <p *ngIf="videoInput().trim() && !videoPreviewId()" class="text-sm text-red-600">
                  Lien YouTube non reconnu.
                </p>

                <div class="flex flex-wrap gap-2">
                  <button
                    type="submit"
                    [disabled]="savingVideo() || !videoChanged() || (videoInput().trim() !== '' && !videoPreviewId())"
                    class="px-4 py-2 rounded-lg text-sm font-semibold transition disabled:opacity-40"
                    style="border: 2px solid #C09453; color: #C09453;"
                  >
                    {{ savingVideo() ? 'Enregistrement...' : 'Enregistrer' }}
                  </button>
                  <button
                    *ngIf="savedVideoId()"
                    type="button"
                    (click)="removeVideo()"
                    [disabled]="savingVideo()"
                    class="px-4 py-2 rounded-lg text-sm font-semibold border-2 border-red-500 text-red-500 disabled:opacity-40"
                  >
                    Retirer la vidéo
                  </button>
                </div>

                <p *ngIf="videoMessage()" class="text-sm" [class.text-green-700]="!videoError()" [class.text-red-600]="videoError()">
                  {{ videoMessage() }}
                </p>
              </div>
            </form>
          </div>

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

  savedVideoId = signal('');
  videoInput = signal('');
  videoPreviewId = computed(() => parseYouTubeId(this.videoInput()));
  videoChanged = computed(() => (this.videoPreviewId() ?? '') !== this.savedVideoId());
  savingVideo = signal(false);
  videoMessage = signal('');
  videoError = signal(false);

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadSlides();
    this.loadVideo();
  }

  loadVideo() {
    this.apiService.getSliderSettings().subscribe({
      next: ({ videoId }) => {
        this.savedVideoId.set(videoId);
        this.videoInput.set(videoId ? `https://www.youtube.com/watch?v=${videoId}` : '');
      },
      error: (err) => console.error('Error loading slider settings:', err),
    });
  }

  onVideoInput(value: string) {
    this.videoInput.set(value);
    this.videoMessage.set('');
  }

  saveVideo() {
    this.persistVideo(this.videoPreviewId() ?? '');
  }

  removeVideo() {
    if (confirm("Retirer la vidéo d'ouverture du slider ?")) {
      this.persistVideo('');
    }
  }

  private persistVideo(videoId: string) {
    this.savingVideo.set(true);
    this.videoMessage.set('');
    this.apiService.updateSliderSettings(videoId).subscribe({
      next: (settings) => {
        this.savingVideo.set(false);
        this.savedVideoId.set(settings.videoId);
        this.videoInput.set(settings.videoId ? `https://www.youtube.com/watch?v=${settings.videoId}` : '');
        this.videoError.set(false);
        this.videoMessage.set(settings.videoId ? 'Vidéo enregistrée.' : 'Vidéo retirée.');
      },
      error: (err) => {
        console.error('Error saving slider video:', err);
        this.savingVideo.set(false);
        this.videoError.set(true);
        this.videoMessage.set("Erreur lors de l'enregistrement de la vidéo.");
      },
    });
  }

  thumbnail(videoId: string): string {
    return youTubeThumbnail(videoId);
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
    return uploadUrl(filepath);
  }
}
