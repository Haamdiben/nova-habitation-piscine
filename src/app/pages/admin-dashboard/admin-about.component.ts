import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminSidenavComponent } from './admin-sidenav.component';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-about',
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
            <h1 class="text-2xl sm:text-3xl font-bold" style="color: #C09453;">À propos de nous</h1>
            <p class="text-gray-600 mt-2 text-sm sm:text-base">Modifiez le contenu affiché sur la page "À propos de nous"</p>
          </div>
        </div>

        <!-- Content -->
        <div class="max-w-4xl mx-auto px-4 py-8">
          <div *ngIf="loading()" class="text-center py-8">
            <p class="text-gray-600">Chargement...</p>
          </div>

          <div *ngIf="!loading()" class="bg-white rounded-lg shadow p-4 sm:p-8">
            <!-- Photo -->
            <div class="mb-8 pb-8 border-b border-gray-200">
              <h2 class="text-lg font-bold mb-4" style="color: #C09453;">Photo (colonne "À propos" — accueil et page dédiée)</h2>
              <div class="flex flex-col sm:flex-row gap-6 items-start">
                <img
                  [src]="getPhotoUrl()"
                  alt="Aperçu photo à propos"
                  class="w-full sm:w-48 h-48 object-cover rounded-lg border border-gray-200 flex-shrink-0"
                />
                <div>
                  <input
                    type="file"
                    #photoInput
                    accept="image/*"
                    (change)="onPhotoSelected($event)"
                    class="hidden"
                  />
                  <button
                    type="button"
                    (click)="photoInput.click()"
                    [disabled]="uploadingPhoto()"
                    class="px-4 py-2 rounded-lg text-sm font-semibold transition"
                    style="border: 2px solid #C09453; color: #C09453;"
                  >
                    {{ uploadingPhoto() ? 'Téléchargement...' : '📤 Changer la photo' }}
                  </button>
                  <p class="text-xs text-gray-500 mt-2">Cette photo apparaît sur la page d'accueil et sur la page À propos.</p>
                </div>
              </div>
            </div>

            <form (ngSubmit)="saveAbout()" class="space-y-8">
              <!-- Intro -->
              <div>
                <h2 class="text-lg font-bold mb-4" style="color: #C09453;">Présentation</h2>
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-900 mb-2">Citation (en italique, en haut de page)</label>
                    <textarea
                      [(ngModel)]="aboutData.quote"
                      name="quote"
                      rows="2"
                      class="w-full px-4 py-2 border-2 rounded-lg"
                      style="border-color: #C09453;"
                    ></textarea>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-900 mb-2">Premier paragraphe</label>
                    <textarea
                      [(ngModel)]="aboutData.paragraph1"
                      name="paragraph1"
                      rows="3"
                      class="w-full px-4 py-2 border-2 rounded-lg"
                      style="border-color: #C09453;"
                    ></textarea>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-900 mb-2">Deuxième paragraphe</label>
                    <textarea
                      [(ngModel)]="aboutData.paragraph2"
                      name="paragraph2"
                      rows="3"
                      class="w-full px-4 py-2 border-2 rounded-lg"
                      style="border-color: #C09453;"
                    ></textarea>
                  </div>
                </div>
              </div>

              <!-- Philosophy -->
              <div class="border-t border-gray-200 pt-8">
                <h2 class="text-lg font-bold mb-4" style="color: #C09453;">Notre philosophie</h2>
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-900 mb-2">Premier texte</label>
                    <textarea
                      [(ngModel)]="aboutData.philosophyText1"
                      name="philosophyText1"
                      rows="3"
                      class="w-full px-4 py-2 border-2 rounded-lg"
                      style="border-color: #C09453;"
                    ></textarea>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-900 mb-2">Deuxième texte</label>
                    <textarea
                      [(ngModel)]="aboutData.philosophyText2"
                      name="philosophyText2"
                      rows="3"
                      class="w-full px-4 py-2 border-2 rounded-lg"
                      style="border-color: #C09453;"
                    ></textarea>
                  </div>
                </div>
              </div>

              <!-- Stats -->
              <div class="border-t border-gray-200 pt-8">
                <h2 class="text-lg font-bold mb-4" style="color: #C09453;">Statistiques</h2>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-900 mb-2">Statistique 1</label>
                    <input
                      type="text"
                      [(ngModel)]="aboutData.stat1Value"
                      name="stat1Value"
                      placeholder="500+"
                      class="w-full px-4 py-2 border-2 rounded-lg mb-2"
                      style="border-color: #C09453;"
                    />
                    <input
                      type="text"
                      [(ngModel)]="aboutData.stat1Label"
                      name="stat1Label"
                      placeholder="Projets réalisés"
                      class="w-full px-4 py-2 border-2 rounded-lg"
                      style="border-color: #C09453;"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-900 mb-2">Statistique 2</label>
                    <input
                      type="text"
                      [(ngModel)]="aboutData.stat2Value"
                      name="stat2Value"
                      placeholder="20+"
                      class="w-full px-4 py-2 border-2 rounded-lg mb-2"
                      style="border-color: #C09453;"
                    />
                    <input
                      type="text"
                      [(ngModel)]="aboutData.stat2Label"
                      name="stat2Label"
                      placeholder="Années d'expérience"
                      class="w-full px-4 py-2 border-2 rounded-lg"
                      style="border-color: #C09453;"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-900 mb-2">Statistique 3</label>
                    <input
                      type="text"
                      [(ngModel)]="aboutData.stat3Value"
                      name="stat3Value"
                      placeholder="100%"
                      class="w-full px-4 py-2 border-2 rounded-lg mb-2"
                      style="border-color: #C09453;"
                    />
                    <input
                      type="text"
                      [(ngModel)]="aboutData.stat3Label"
                      name="stat3Label"
                      placeholder="Satisfaction client"
                      class="w-full px-4 py-2 border-2 rounded-lg"
                      style="border-color: #C09453;"
                    />
                  </div>
                </div>
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
export class AdminAboutComponent implements OnInit {
  loading = signal(true);
  saving = signal(false);
  uploadingPhoto = signal(false);
  successMessage = signal('');
  errorMessage = signal('');
  photoFilepath = signal('');

  aboutData = {
    quote: '',
    paragraph1: '',
    paragraph2: '',
    philosophyText1: '',
    philosophyText2: '',
    stat1Value: '',
    stat1Label: '',
    stat2Value: '',
    stat2Label: '',
    stat3Value: '',
    stat3Label: '',
  };

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.apiService.getAboutInfo().subscribe({
      next: (data) => {
        this.aboutData = {
          quote: data.quote || '',
          paragraph1: data.paragraph1 || '',
          paragraph2: data.paragraph2 || '',
          philosophyText1: data.philosophyText1 || '',
          philosophyText2: data.philosophyText2 || '',
          stat1Value: data.stat1Value || '',
          stat1Label: data.stat1Label || '',
          stat2Value: data.stat2Value || '',
          stat2Label: data.stat2Label || '',
          stat3Value: data.stat3Value || '',
          stat3Label: data.stat3Label || '',
        };
        this.photoFilepath.set(data.photoFilepath || '');
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading about info:', err);
        this.loading.set(false);
      },
    });
  }

  onPhotoSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.uploadingPhoto.set(true);
    this.apiService.uploadAboutPhoto(file).subscribe({
      next: (data) => {
        this.photoFilepath.set(data.photoFilepath || '');
        this.uploadingPhoto.set(false);
        event.target.value = '';
      },
      error: (err) => {
        console.error('Error uploading photo:', err);
        this.uploadingPhoto.set(false);
        event.target.value = '';
      },
    });
  }

  getPhotoUrl(): string {
    const path = this.photoFilepath();
    return path ? `http://localhost:3000/${path}` : '/logo-nova-600.png';
  }

  saveAbout() {
    this.saving.set(true);
    this.errorMessage.set('');

    this.apiService.updateAboutInfo(this.aboutData).subscribe({
      next: () => {
        this.saving.set(false);
        this.successMessage.set('✅ Contenu "À propos" enregistré avec succès!');
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (err) => {
        console.error('Error saving about info:', err);
        this.saving.set(false);
        this.errorMessage.set("❌ Erreur lors de l'enregistrement. Vérifiez que vous êtes bien connecté.");
      },
    });
  }

  logout() {
    this.authService.logout();
  }
}
