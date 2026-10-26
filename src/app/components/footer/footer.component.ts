import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <footer class="footer on-dark pt-24 pb-10 px-6 sm:px-10 lg:px-16">
      <div class="max-w-6xl mx-auto">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20 text-center md:text-left">
          <!-- About -->
          <div>
            <img src="/icon-only.png" alt="Nova Habitation et Piscine" class="h-16 w-32 mb-6 mx-auto md:mx-0">
            <p class="text-white/75 text-sm leading-relaxed mb-6">{{ info()?.tagline }}</p>
            <div class="text-xs tracking-wider text-white/50 space-y-1">
              <p>SIREN : {{ info()?.siren }}</p>
              <p>SIRET : {{ info()?.siret }}</p>
            </div>
          </div>

          <!-- Services -->
          <div>
            <h3 class="footer-heading">Services</h3>
            <ul class="space-y-3 text-sm">
              <li><a [routerLink]="['/apropos']" fragment="domaines-expertise" class="footer-link">Construction</a></li>
              <li><a [routerLink]="['/apropos']" fragment="domaines-expertise" class="footer-link">Rénovation</a></li>
              <li><a [routerLink]="['/apropos']" fragment="domaines-expertise" class="footer-link">Peinture</a></li>
              <li><a [routerLink]="['/apropos']" fragment="domaines-expertise" class="footer-link">Bâtiment</a></li>
            </ul>
          </div>

          <!-- Quick Links -->
          <div>
            <h3 class="footer-heading">Navigation</h3>
            <ul class="space-y-3 text-sm">
              <li><a routerLink="/" class="footer-link">Accueil</a></li>
              <li><a routerLink="/apropos" class="footer-link">À propos</a></li>
              <li><a routerLink="/realisations" class="footer-link">Réalisations</a></li>
              <li><a routerLink="/contact" class="footer-link">Contact</a></li>
            </ul>
          </div>

          <!-- Contact Info -->
          <div>
            <h3 class="footer-heading">Contact</h3>
            <ul class="space-y-3 text-sm text-white/75">
              <li><a [href]="'mailto:' + info()?.email" class="footer-link break-all">{{ info()?.email }}</a></li>
              <li><a [href]="'tel:' + info()?.phone" class="footer-link">{{ info()?.phone }}</a></li>
              <li>{{ info()?.address }}</li>
              <li class="whitespace-pre-line">{{ info()?.hours }}</li>
            </ul>
          </div>
        </div>

        <!-- Divider -->
        <div class="border-t border-white/20 pt-10 flex flex-col md:flex-row items-center justify-between gap-6 text-xs tracking-wider">
          <p class="text-white/55">
            © 2026 Nova Habitation et Piscine. Tous droits réservés.
            <span class="mx-2">·</span>
            <a [href]="info()?.legalUrl || '#'" class="footer-link">Mentions légales</a>
          </p>
          <div class="flex gap-8 uppercase tracking-[0.25em]">
            <a [href]="info()?.facebookUrl || '#'" class="footer-link">Facebook</a>
            <a [href]="info()?.instagramUrl || '#'" class="footer-link">Instagram</a>
            <a [href]="info()?.linkedinUrl || '#'" class="footer-link">LinkedIn</a>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: `
    /* Mediterranean blue gradient, from deep sea to pool blue */
    .footer {
      background: linear-gradient(135deg, #123a5e 0%, #1d5684 55%, #2a76a6 100%);
    }
    .footer-heading {
      @apply font-body font-medium uppercase tracking-[0.3em] text-xs text-white mb-6;
    }
    .footer-link {
      @apply text-white/75 transition-colors hover:text-white;
    }
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
