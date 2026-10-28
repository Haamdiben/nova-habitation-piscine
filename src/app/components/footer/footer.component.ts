import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { socialLinks } from '../../utils/social-links';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <footer class="footer pt-20 pb-10 px-6 sm:px-10 lg:px-16">
      <div class="max-w-5xl mx-auto">
        <!-- Columns grouped in the centre with a fixed gap, rather than spread across the full width -->
        <div class="flex flex-col md:flex-row md:flex-wrap md:justify-center gap-10 md:gap-x-14 lg:gap-x-20 mb-14 text-center md:text-left">
          <!-- About -->
          <div class="md:max-w-[15rem]">
            <img src="/logo-nova-horizontal.webp" alt="Nova Habitat – Piscine" width="480" height="112" loading="lazy" class="h-auto w-56 mb-5 mx-auto md:mx-0">
            <p class="text-sea-100/75 text-sm leading-relaxed mb-5">{{ info()?.tagline }}</p>
            <div class="text-xs tracking-wider text-sea-100/75 space-y-1">
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
            <ul class="space-y-3 text-sm text-sea-100/75">
              <li><a [href]="'mailto:' + info()?.email" class="footer-link">{{ info()?.email }}</a></li>
              <li><a [href]="'tel:' + info()?.phone" class="footer-link">{{ info()?.phone }}</a></li>
              <li>{{ info()?.address }}</li>
              <li class="whitespace-pre-line">{{ info()?.hours }}</li>
            </ul>
          </div>
        </div>

        <!-- Bottom bar -->
        <div class="border-t border-sea-500/15 pt-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs tracking-wider">
          <p class="text-sea-100/75">
            © 2026 Nova Habitation et Piscine. Tous droits réservés.
            <span class="mx-2">·</span>
            <a [href]="info()?.legalUrl || '#'" class="footer-link">Mentions légales</a>
          </p>
          @if (socials().length) {
            <div class="flex gap-8 uppercase tracking-[0.25em]">
              @for (social of socials(); track social.label) {
                <a [href]="social.url" target="_blank" rel="noopener" class="footer-link">{{ social.label }}</a>
              }
            </div>
          }
        </div>
      </div>
    </footer>
  `,
  styles: `
    /* White fading into a very pale pool blue, with a fine blue line on top */
    .footer {
      background: linear-gradient(180deg, #ffffff 0%, #e4eff4 100%);
      border-top: 1px solid rgb(var(--sea-500) / 0.25);
    }
    .footer-heading {
      @apply font-body font-medium uppercase tracking-[0.3em] text-xs text-sea-500 mb-5;
    }
    .footer-link {
      @apply text-sea-100/75 transition-colors hover:text-sea-500;
    }
  `,
})
export class FooterComponent implements OnInit {
  info = signal<any>(null);
  socials = computed(() => socialLinks(this.info()));

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.apiService.getContactInfo().subscribe({
      next: (data) => this.info.set(data),
      error: (err) => console.error('Error loading contact info:', err),
    });
  }
}
