import { Component, OnInit, RESPONSE_INIT, inject, signal } from '@angular/core';
import { ApiService, DEFAULT_MAINTENANCE_MESSAGE } from '../../services/api.service';

/** Shown instead of every public page while maintenance mode is on (switched on from the back office) */
@Component({
  selector: 'app-maintenance',
  standalone: true,
  template: `
    <main id="contenu" class="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-16">
      <div class="maintenance__glow" aria-hidden="true"></div>

      <div class="relative w-full max-w-xl text-center">
        <img
          src="/logo-nova-horizontal.webp"
          srcset="/logo-nova-horizontal.webp 480w, /logo-nova-horizontal-960.webp 960w"
          sizes="(min-width: 640px) 26rem, 20rem"
          alt="Nova Habitat – Piscine"
          width="960"
          height="223"
          class="mx-auto mb-12 h-auto w-80 sm:w-[26rem]"
        />

        <span class="eyebrow">Site en maintenance</span>
        <h1 class="font-display text-5xl sm:text-6xl leading-[1.05] tracking-tight text-balance text-sheen mb-6">Nous revenons très vite</h1>
        <p class="text-sea-100/75 leading-relaxed mb-12">{{ message() }}</p>

        @if (info(); as i) {
          <div class="card px-8 py-10">
            @if (i.managerName) {
              <p class="font-display text-2xl text-sea-100">{{ i.managerName }}</p>
              <p class="mt-1 mb-8 text-xs uppercase tracking-[0.35em] text-gold">Gérant</p>
            }
            <ul class="space-y-3 text-sea-100/90">
              @if (i.phone) {
                <li><a [href]="'tel:' + i.phone" class="link-accent text-lg">{{ i.phone }}</a></li>
              }
              @if (i.email) {
                <li><a [href]="'mailto:' + i.email" class="link-accent">{{ i.email }}</a></li>
              }
              @if (i.address) {
                <li class="text-sea-100/75">{{ i.address }}</li>
              }
            </ul>
            @if (i.tagline) {
              <span class="divider-accent mx-auto my-8"></span>
              <p class="font-display italic text-2xl text-sea-200">« {{ i.tagline }} »</p>
            }
          </div>
        }
      </div>
    </main>
  `,
  styles: `
    .maintenance__glow {
      position: absolute;
      inset: -20%;
      background:
        radial-gradient(40% 35% at 20% 15%, rgb(var(--sea-800) / 0.55), transparent 70%),
        radial-gradient(45% 40% at 85% 85%, rgb(var(--sea-900) / 0.9), transparent 70%);
      pointer-events: none;
    }
  `,
})
export class MaintenanceComponent implements OnInit {
  private api = inject(ApiService);
  private responseInit = inject(RESPONSE_INIT, { optional: true });

  message = signal(DEFAULT_MAINTENANCE_MESSAGE);
  info = signal<any>(null);

  constructor() {
    // "Temporarily unavailable": search engines keep the site's pages and come back later
    if (this.responseInit) this.responseInit.status = 503;
  }

  ngOnInit() {
    this.api.getSiteSettings().subscribe({
      next: (settings) => this.message.set(settings.maintenanceMessage || DEFAULT_MAINTENANCE_MESSAGE),
      error: () => {},
    });
    this.api.getContactInfo().subscribe({
      next: (info) => this.info.set(info),
      error: () => {},
    });
  }
}
