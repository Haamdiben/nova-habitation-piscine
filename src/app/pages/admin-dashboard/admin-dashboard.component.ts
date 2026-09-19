import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { AdminSidenavComponent } from './admin-sidenav.component';

@Component({
  selector: 'app-admin-dashboard',
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
            <h1 class="text-2xl sm:text-3xl font-bold" style="color: #C09453;">Réalisations</h1>
            <p class="text-gray-600 mt-2 text-sm sm:text-base">Choisissez une catégorie pour gérer ses chantiers</p>
          </div>
        </div>

        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          <div *ngIf="!loading()" class="grid grid-cols-1 gap-4">
            <div
              *ngFor="let category of categories()"
              class="bg-white rounded-lg shadow p-5 flex items-center justify-between gap-3"
            >
              <a [routerLink]="['/admin/dashboard/realisations', category.id]" class="flex-1 min-w-0">
                <h3 class="text-lg font-bold text-gray-900 truncate">{{ category.name }}</h3>
                <p class="text-sm text-gray-500">{{ category.chantiers?.length || 0 }} chantier(s)</p>
              </a>
              <div class="flex items-center gap-2 flex-shrink-0">
                <a
                  [routerLink]="['/admin/dashboard/realisations', category.id]"
                  class="px-4 py-2 rounded-lg text-sm font-semibold transition"
                  style="border: 2px solid #C09453; color: #C09453;"
                >
                  Gérer →
                </a>
                <button
                  (click)="deleteCategory(category)"
                  class="w-9 h-9 rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 transition"
                  title="Supprimer la catégorie"
                >
                  🗑️
                </button>
              </div>
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

  logout() {
    this.authService.logout();
  }
}
