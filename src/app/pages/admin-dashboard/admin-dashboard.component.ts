import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { uploadUrl } from '../../utils/upload-url';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <!-- Header -->
    <div class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 class="text-2xl sm:text-3xl font-bold" style="color: #C09453;">Réalisations</h1>
        <p class="text-gray-600 mt-2 text-sm sm:text-base">Choisissez une catégorie pour gérer ses chantiers</p>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Add Category Form -->
      <div class="bg-white rounded-lg shadow p-4 sm:p-6 mb-8">
        <button
          type="button"
          (click)="toggleAddForm()"
          class="w-full flex items-center justify-between"
        >
          <h2 class="text-lg font-bold" style="color: #C09453;">+ Ajouter une catégorie</h2>
          <span class="text-gray-400 text-xl transition-transform" [class.rotate-180]="showAddForm()">▾</span>
        </button>

        <form *ngIf="showAddForm()" (ngSubmit)="addCategory()" class="flex flex-col sm:flex-row gap-3 mt-4">
          <input
            type="text"
            [(ngModel)]="newCategoryName"
            name="newCategoryName"
            placeholder="Nom de la catégorie (ex: Terrasses)"
            class="flex-1 px-4 py-2 border-2 rounded-lg"
            style="border-color: #C09453;"
          />
          <button
            type="submit"
            [disabled]="addingCategory()"
            class="px-6 py-2 rounded-lg font-semibold transition"
            style="border: 2px solid #C09453; color: #C09453;"
          >
            {{ addingCategory() ? 'Ajout...' : '+ Nouvelle catégorie' }}
          </button>
        </form>
      </div>

      <div *ngIf="loading()" class="text-center py-8">
        <p class="text-gray-600">Chargement...</p>
      </div>

      <div *ngIf="!loading() && categories().length === 0" class="bg-white rounded-lg shadow p-6 text-center text-gray-500">
        Aucune catégorie pour le moment. Ajoutez-en une ci-dessus pour commencer.
      </div>

      <!-- Category Cards -->
      <div *ngIf="!loading()" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          *ngFor="let category of categories()"
          class="bg-white rounded-xl shadow-md hover:shadow-lg transition overflow-hidden flex flex-col"
        >
          <a [routerLink]="['/admin/dashboard/realisations', category.id]" class="block">
            <div class="h-32 flex items-center justify-center" [style.background]="getCoverPhoto(category) ? 'none' : '#f3e9db'">
              <img
                *ngIf="getCoverPhoto(category) as cover"
                [src]="getPhotoUrl(cover)"
                [alt]="category.name"
                class="w-full h-32 object-cover"
              />
              <span *ngIf="!getCoverPhoto(category)" class="text-4xl">📁</span>
            </div>
          </a>

          <div class="p-5 flex flex-col flex-1">
            <a [routerLink]="['/admin/dashboard/realisations', category.id]">
              <h3 class="text-lg font-bold text-gray-900 truncate">{{ category.name }}</h3>
            </a>
            <span
              class="inline-block mt-1 mb-4 text-xs font-semibold px-2.5 py-1 rounded-full self-start"
              style="background: #f3e9db; color: #7a5a30;"
            >
              {{ category.chantiers?.length || 0 }} chantier(s)
            </span>

            <div class="mt-auto flex items-center gap-2">
              <a
                [routerLink]="['/admin/dashboard/realisations', category.id]"
                class="flex-1 text-center px-4 py-2 rounded-lg text-sm font-semibold transition"
                style="border: 2px solid #C09453; color: #C09453;"
              >
                Gérer →
              </a>
              <button
                (click)="deleteCategory(category)"
                class="w-9 h-9 rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 transition flex-shrink-0"
                title="Supprimer la catégorie"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AdminDashboardComponent implements OnInit {
  categories = signal<any[]>([]);
  loading = signal(false);
  addingCategory = signal(false);
  showAddForm = signal(false);
  newCategoryName = '';

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.loading.set(true);
    this.apiService.getRealisations().subscribe({
      next: (data) => {
        this.categories.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading realisations:', err);
        this.loading.set(false);
      },
    });
  }

  toggleAddForm() {
    this.showAddForm.set(!this.showAddForm());
  }

  addCategory() {
    const name = this.newCategoryName.trim();
    if (!name) return;

    this.addingCategory.set(true);
    this.apiService.createRealisation(name).subscribe({
      next: () => {
        this.newCategoryName = '';
        this.addingCategory.set(false);
        this.showAddForm.set(false);
        this.loadCategories();
      },
      error: (err) => {
        console.error('Error creating category:', err);
        this.addingCategory.set(false);
        alert('Impossible de créer cette catégorie (nom déjà utilisé ?)');
      },
    });
  }

  getCoverPhoto(category: any): string | null {
    const chantiers = category.chantiers || [];
    for (const chantier of chantiers) {
      if (chantier.photos && chantier.photos.length > 0) {
        return chantier.photos[0].filepath;
      }
    }
    return null;
  }

  getPhotoUrl(filepath: string): string {
    return uploadUrl(filepath);
  }

  deleteCategory(category: any) {
    const count = category.chantiers?.length || 0;
    const warning =
      count > 0
        ? `Cette catégorie contient ${count} chantier(s). Les supprimer supprimera aussi tous leurs chantiers et photos. Continuer ?`
        : 'Êtes-vous sûr de vouloir supprimer cette catégorie ?';

    if (confirm(warning)) {
      this.apiService.deleteRealisation(category.id).subscribe({
        next: () => this.loadCategories(),
        error: (err) => console.error('Error deleting category:', err),
      });
    }
  }
}
