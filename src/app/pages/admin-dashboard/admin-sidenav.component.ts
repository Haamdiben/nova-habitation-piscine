import { Component, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-admin-sidenav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <!-- Mobile Top Bar -->
    <div class="md:hidden fixed top-0 left-0 right-0 z-30 bg-gray-900 text-white flex items-center justify-between px-4 h-16 shadow-lg">
      <h2 class="text-xl font-bold" style="color: #C09453;">ipswim Admin</h2>
      <button
        (click)="toggleMenu()"
        class="p-2 rounded-lg hover:bg-gray-800 transition"
        aria-label="Toggle menu"
      >
        @if (!isMenuOpen()) {
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        } @else {
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        }
      </button>
    </div>

    <!-- Mobile Backdrop -->
    @if (isMenuOpen()) {
      <div
        class="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
        (click)="closeMenu()"
      ></div>
    }

    <!-- Sidenav -->
    <aside
      class="w-64 h-screen bg-gray-900 text-white fixed left-0 top-0 shadow-lg z-50 transition-transform duration-300 md:translate-x-0"
      [class.-translate-x-full]="!isMenuOpen()"
      [class.translate-x-0]="isMenuOpen()"
    >
      <div class="p-6 border-b border-gray-700">
        <h2 class="text-2xl font-bold" style="color: #C09453;">ipswim Admin</h2>
        <p class="text-gray-400 text-sm mt-2">Panel de gestion</p>
      </div>

      <nav class="mt-8 space-y-2 px-4">
        <a
          routerLink="/admin/dashboard/realisations"
          routerLinkActive="bg-gray-800"
          (click)="closeMenu()"
          class="block px-4 py-3 rounded-lg transition hover:bg-gray-800"
        >
          <span class="text-lg">📸</span> Réalisations
        </a>

        <a
          routerLink="/admin/dashboard/contact"
          routerLinkActive="bg-gray-800"
          (click)="closeMenu()"
          class="block px-4 py-3 rounded-lg transition hover:bg-gray-800"
        >
          <span class="text-lg">📋</span> Informations Contact
        </a>

        <a
          routerLink="/admin/dashboard/about"
          routerLinkActive="bg-gray-800"
          (click)="closeMenu()"
          class="block px-4 py-3 rounded-lg transition hover:bg-gray-800"
        >
          <span class="text-lg">📝</span> À propos de nous
        </a>

        <a
          routerLink="/admin/dashboard/slides"
          routerLinkActive="bg-gray-800"
          (click)="closeMenu()"
          class="block px-4 py-3 rounded-lg transition hover:bg-gray-800"
        >
          <span class="text-lg">🖼️</span> Slider Accueil
        </a>
      </nav>

      <div class="absolute bottom-6 left-4 right-4 border-t border-gray-700 pt-4 flex flex-col gap-2">
        <a
          routerLink="/"
          target="_blank"
          class="w-full px-4 py-3 rounded-lg text-sm font-semibold transition text-center border-2 border-gray-500 text-gray-300 hover:bg-gray-800"
        >
          🌐 Voir le site
        </a>
        <button
          (click)="logout()"
          class="w-full px-4 py-3 rounded-lg text-sm font-semibold transition"
          style="border: 2px solid #C09453; color: #C09453;"
        >
          Déconnexion
        </button>
      </div>
    </aside>
  `,
})
export class AdminSidenavComponent {
  onLogout = output<void>();
  isMenuOpen = signal(false);

  toggleMenu() {
    this.isMenuOpen.set(!this.isMenuOpen());
  }

  closeMenu() {
    this.isMenuOpen.set(false);
  }

  logout() {
    this.onLogout.emit();
  }
}
