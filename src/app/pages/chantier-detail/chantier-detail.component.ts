import { Component, OnInit, RESPONSE_INIT, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { PhotoLightboxComponent, LightboxPhoto } from '../../components/photo-lightbox/photo-lightbox.component';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';
import { ApiService } from '../../services/api.service';
import { SITE_URL, SeoService } from '../../services/seo.service';
import { uploadUrl } from '../../utils/upload-url';

@Component({
  selector: 'app-chantier-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent, FooterComponent, PhotoLightboxComponent, ScrollRevealDirective],
  template: `
    <app-navbar></app-navbar>
    <main id="contenu" tabindex="-1" class="outline-none">

    <section class="min-h-screen">
      <!-- Loading -->
      <div *ngIf="loading()" class="py-32 text-center">
        <p class="text-sea-100/75">Chargement...</p>
      </div>

      <!-- Not found -->
      <div *ngIf="!loading() && !chantier()" class="py-32 text-center px-4">
        <p class="text-sea-100/75 text-lg mb-6">Ce chantier est introuvable.</p>
        <a routerLink="/realisations" class="btn-outline">
          ← Retour aux réalisations
        </a>
      </div>

      <!-- Content -->
      <ng-container *ngIf="!loading() && chantier() as c">
        <!-- Hero photo -->
        <div
          class="on-dark relative h-[45vh] sm:h-[55vh] w-full bg-ink-700 cursor-pointer group overflow-hidden"
          (click)="openGallery(0)"
        >
          <img
            *ngIf="c.photos && c.photos.length > 0"
            [src]="getPhotoUrl(c.photos[0].filepath)"
            [alt]="c.title"
            class="w-full h-full object-cover group-hover:scale-105 transition duration-700"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

          <div class="absolute bottom-0 left-0 right-0 px-4 sm:px-10 pb-8 sm:pb-10">
            <a routerLink="/realisations" class="inline-flex items-center gap-2 text-sea-50/90 hover:text-sea-50 text-sm mb-4 transition" (click)="$event.stopPropagation()">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
              Réalisations
            </a>
            <p class="eyebrow !mb-3 text-sea-300">
              {{ c.realisation?.name }}
            </p>
            <h1 class="text-5xl sm:text-7xl leading-[1] tracking-tight text-sea-50" style="text-shadow: 0 2px 16px rgba(0,0,0,0.5);">
              {{ c.title }}
            </h1>
          </div>

          <div
            *ngIf="c.photos && c.photos.length > 1"
            class="absolute top-4 right-4 sm:top-6 sm:right-6 bg-black bg-opacity-50 text-sea-50 text-sm font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M14 8h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            {{ c.photos.length }} photos — voir la galerie
          </div>
        </div>

        <!-- Description -->
        <div appScrollReveal="up" class="max-w-4xl mx-auto px-4 sm:px-6 py-14">
          <h2 class="text-4xl mb-6 text-sea-200">Description du chantier</h2>
          <p class="text-sea-100/75 leading-relaxed whitespace-pre-line">{{ c.description }}</p>
        </div>

        <!-- Photo grid -->
        <div *ngIf="c.photos && c.photos.length > 0" class="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
          <h2 appScrollReveal="up" class="text-4xl mb-8 text-sea-200">Galerie photo</h2>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            <button
              *ngFor="let photo of c.photos; let i = index"
              (click)="openGallery(i)"
              appScrollReveal="up"
              [revealDelay]="(i % 4) * 80"
              class="relative h-36 sm:h-44 overflow-hidden group"
            >
              <img [src]="getPhotoUrl(photo.filepath)" [alt]="c.title" class="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
              <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition"></div>
            </button>
          </div>
        </div>

        <!-- CTA -->
        <div appScrollReveal="up" class="max-w-4xl mx-auto px-4 sm:px-6 pb-20 text-center">
          <a
            routerLink="/contact"
            class="btn-outline"
          >
            Discuter d'un projet similaire
          </a>
        </div>
      </ng-container>
    </section>

    <!-- Footer -->
    </main>

    <app-footer></app-footer>

    <!-- Lightbox -->
    <app-photo-lightbox
      *ngIf="lightboxOpen() && chantier()"
      [photos]="chantier()!.photos || []"
      [title]="chantier()!.title"
      [startIndex]="lightboxIndex()"
      (close)="lightboxOpen.set(false)"
    ></app-photo-lightbox>
  `,
})
export class ChantierDetailComponent implements OnInit {
  chantier = signal<any | null>(null);
  loading = signal(true);
  lightboxOpen = signal(false);
  lightboxIndex = signal(0);

  /** Set during server rendering only: lets a missing chantier answer with a real 404 */
  private responseInit = inject(RESPONSE_INIT, { optional: true });

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private seo: SeoService,
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('id'));
      if (id) {
        this.loadChantier(id);
      }
    });
  }

  loadChantier(id: number) {
    this.loading.set(true);
    this.apiService.getChantier(id).subscribe({
      next: (data) => {
        this.chantier.set(data);
        this.loading.set(false);
        this.updateSeo(data);
      },
      error: (err) => {
        if (err?.status !== 404) console.error('Error loading chantier:', err);
        this.chantier.set(null);
        this.loading.set(false);
        // A deleted or unknown chantier must not be indexed as an empty page
        if (this.responseInit && err?.status === 404) this.responseInit.status = 404;
      },
    });
  }

  /** Title, description and share image taken from the chantier itself */
  private updateSeo(chantier: any) {
    const description = (chantier.description || '').replace(/\s+/g, ' ').trim();
    const photo = chantier.photos?.[0]?.filepath;
    const photoUrl = photo ? this.getPhotoUrl(photo) : '';
    this.seo.update({
      title: `${chantier.title} | Nova Habitation et Piscine`,
      description: description.length > 160 ? description.slice(0, 157).trimEnd() + '…' : description || undefined,
      image: photoUrl && !photoUrl.startsWith('http') ? SITE_URL + photoUrl : photoUrl || undefined,
    });
  }

  openGallery(index: number) {
    this.lightboxIndex.set(index);
    this.lightboxOpen.set(true);
  }

  getPhotoUrl(filepath: string): string {
    return uploadUrl(filepath);
  }
}
