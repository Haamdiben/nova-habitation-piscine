import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="bg-gray-800 text-white py-16 px-4 sm:px-6 lg:px-8">
      <div class="max-w-6xl mx-auto">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12 text-center md:text-left">
          <!-- About -->
          <div>
            <h3 class="text-xl font-bold mb-4">ipswim</h3>
            <p class="text-gray-300 text-sm mb-4">Spécialiste en construction et rénovation de piscines depuis plus de 20 ans.</p>
            <div class="text-sm text-gray-400">
              <p><strong>SIREN:</strong> {{ info()?.siren }}</p>
              <p><strong>SIRET:</strong> {{ info()?.siret }}</p>
            </div>
          </div>

          <!-- Services -->
          <div>
            <h3 class="text-xl font-bold mb-4">Services</h3>
            <ul class="space-y-2 text-gray-300 text-sm">
              <li><a href="#" class="hover:text-white transition">Construction</a></li>
              <li><a href="#" class="hover:text-white transition">Rénovation</a></li>
              <li><a href="#" class="hover:text-white transition">Peinture</a></li>
              <li><a href="#" class="hover:text-white transition">Bâtiment</a></li>
            </ul>
          </div>

          <!-- Quick Links -->
          <div>
            <h3 class="text-xl font-bold mb-4">Navigation</h3>
            <ul class="space-y-2 text-gray-300 text-sm">
              <li><a routerLink="/" class="hover:text-white transition">Accueil</a></li>
              <li><a routerLink="/apropos" class="hover:text-white transition">À propos</a></li>
              <li><a routerLink="/realisations" class="hover:text-white transition">Réalisations</a></li>
              <li><a routerLink="/contact" class="hover:text-white transition">Contact</a></li>
            </ul>
          </div>

          <!-- Contact Info -->
          <div>
            <h3 class="text-xl font-bold mb-4">Contact</h3>
            <ul class="space-y-2 text-gray-300 text-sm">
              <li>📧 <a [href]="'mailto:' + info()?.email" class="hover:text-white transition">{{ info()?.email }}</a></li>
              <li>📱 <a [href]="'tel:' + info()?.phone" class="hover:text-white transition">{{ info()?.phone }}</a></li>
              <li>📍 {{ info()?.address }}</li>
              <li class="whitespace-pre-line">🕐 {{ info()?.hours }}</li>
            </ul>
          </div>
        </div>

        <!-- Divider -->
        <div class="border-t border-gray-700 pt-8 text-center">
          <div class="flex justify-center gap-6 mb-4">
            <a href="#" class="text-gray-300 hover:text-white transition">Facebook</a>
            <a href="#" class="text-gray-300 hover:text-white transition">Instagram</a>
            <a href="#" class="text-gray-300 hover:text-white transition">LinkedIn</a>
          </div>
          <p class="text-gray-400 text-sm">© 2026 ipswim. Tous droits réservés. | <a href="#" class="hover:text-white transition">Mentions légales</a></p>
        </div>
      </div>
    </section>
  `,
})
export class FooterComponent implements OnInit {
  info = signal<any>(null);

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.apiService.getContactInfo().subscribe({
      next: (data) => this.info.set(data),
      error: (err) => console.error('Error loading contact info:', err),
    });
  }
}
