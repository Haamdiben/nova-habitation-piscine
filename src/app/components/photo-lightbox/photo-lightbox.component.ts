import { Component, HostListener, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface LightboxPhoto {
  filepath: string;
  filename?: string;
}

@Component({
  selector: 'app-photo-lightbox',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
      (click)="close.emit()"
    >
      <!-- Blurred artistic backdrop using the current photo -->
      <div
        class="absolute inset-0 bg-black"
        [style.backgroundImage]="'url(' + photoUrl(activePhoto()) + ')'"
        style="background-size: cover; background-position: center; filter: blur(40px) brightness(0.4); transform: scale(1.2);"
      ></div>
      <div class="absolute inset-0 bg-black bg-opacity-40"></div>

      <!-- Close button -->
      <button
        (click)="close.emit(); $event.stopPropagation()"
        class="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 w-11 h-11 rounded-full bg-black bg-opacity-40 text-white flex items-center justify-center hover:bg-opacity-70 transition"
        aria-label="Fermer"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>

      <!-- Title / caption -->
      <div class="absolute top-0 left-0 right-0 z-20 px-6 pt-6 sm:pt-8 text-center pointer-events-none">
        <h3 class="text-white text-xl sm:text-2xl font-bold tracking-wide" style="text-shadow: 0 2px 12px rgba(0,0,0,0.6);">
          {{ title() }}
        </h3>
        <p class="text-sm mt-1" style="color: #E9C98C; text-shadow: 0 1px 6px rgba(0,0,0,0.6);">
          {{ index() + 1 }} / {{ photos().length }}
        </p>
      </div>

      <!-- Prev arrow -->
      <button
        *ngIf="photos().length > 1"
        (click)="prev(); $event.stopPropagation()"
        class="hidden sm:flex absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black bg-opacity-30 text-white items-center justify-center hover:bg-opacity-60 transition"
        aria-label="Photo précédente"
      >
        <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
        </svg>
      </button>

      <!-- Next arrow -->
      <button
        *ngIf="photos().length > 1"
        (click)="next(); $event.stopPropagation()"
        class="hidden sm:flex absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black bg-opacity-30 text-white items-center justify-center hover:bg-opacity-60 transition"
        aria-label="Photo suivante"
      >
        <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
        </svg>
      </button>

      <!-- Main image with fade/scale transition -->
      <div class="relative z-10 w-full h-full flex items-center justify-center px-4 sm:px-20 py-24" (click)="$event.stopPropagation()">
        <img
          [src]="photoUrl(activePhoto())"
          [alt]="title()"
          class="max-w-full max-h-full object-contain rounded-lg shadow-2xl lightbox-image"
        />
      </div>

      <!-- Mobile nav (swipe-style buttons under image) -->
      <div *ngIf="photos().length > 1" class="sm:hidden absolute bottom-24 left-0 right-0 z-20 flex justify-center gap-6">
        <button
          (click)="prev(); $event.stopPropagation()"
          class="w-11 h-11 rounded-full bg-black bg-opacity-40 text-white flex items-center justify-center"
          aria-label="Photo précédente"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>
        <button
          (click)="next(); $event.stopPropagation()"
          class="w-11 h-11 rounded-full bg-black bg-opacity-40 text-white flex items-center justify-center"
          aria-label="Photo suivante"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
      </div>

      <!-- Thumbnail strip -->
      <div
        *ngIf="photos().length > 1"
        class="absolute bottom-4 sm:bottom-6 left-0 right-0 z-20 px-4"
        (click)="$event.stopPropagation()"
      >
        <div class="flex gap-2 overflow-x-auto justify-start sm:justify-center pb-1 thumb-strip">
          <button
            *ngFor="let photo of photos(); let i = index"
            (click)="goTo(i)"
            class="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded overflow-hidden border-2 transition"
            [style.borderColor]="i === index() ? '#C09453' : 'transparent'"
            [style.opacity]="i === index() ? '1' : '0.55'"
          >
            <img [src]="photoUrl(photo)" [alt]="title()" class="w-full h-full object-cover" />
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    .lightbox-image {
      animation: lightboxFadeIn 0.35s ease;
    }
    @keyframes lightboxFadeIn {
      from { opacity: 0; transform: scale(0.97); }
      to { opacity: 1; transform: scale(1); }
    }
    .thumb-strip::-webkit-scrollbar {
      height: 4px;
    }
    .thumb-strip::-webkit-scrollbar-thumb {
      background: rgba(255,255,255,0.3);
      border-radius: 4px;
    }
  `],
})
export class PhotoLightboxComponent {
  photos = input.required<LightboxPhoto[]>();
  title = input<string>('');
  startIndex = input<number>(0);
  close = output<void>();

  private currentIndex = signal(0);

  ngOnInit() {
    this.currentIndex.set(this.startIndex());
  }

  index() {
    return this.currentIndex();
  }

  activePhoto(): LightboxPhoto | undefined {
    return this.photos()[this.currentIndex()];
  }

  photoUrl(photo: LightboxPhoto | undefined): string {
    if (!photo) return '';
    return `http://localhost:3000/${photo.filepath}`;
  }

  next() {
    const total = this.photos().length;
    this.currentIndex.set((this.currentIndex() + 1) % total);
  }

  prev() {
    const total = this.photos().length;
    this.currentIndex.set((this.currentIndex() - 1 + total) % total);
  }

  goTo(i: number) {
    this.currentIndex.set(i);
  }

  @HostListener('document:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') this.close.emit();
    if (event.key === 'ArrowRight') this.next();
    if (event.key === 'ArrowLeft') this.prev();
  }
}
