import {
  Component,
  ElementRef,
  OnDestroy,
  ViewEncapsulation,
  afterNextRender,
  input,
  viewChild,
} from '@angular/core';
import Swiper from 'swiper';
import { A11y, Navigation, Pagination } from 'swiper/modules';
import { ChantierCardComponent } from '../chantier-card/chantier-card.component';

/** One horizontal, swipeable row of project cards (used for each category on the réalisations page). */
@Component({
  selector: 'app-chantier-slider',
  standalone: true,
  imports: [ChantierCardComponent],
  host: { class: 'block' },
  // Swiper adds its classes at runtime, so styles must not be view-encapsulated (they're scoped by class name)
  encapsulation: ViewEncapsulation.None,
  template: `
    <!-- Side padding on tablet/desktop holds the arrows outside the cards -->
    <div class="chantier-slider relative md:px-16 lg:px-20">
      <!-- Padding leaves room for the cards' shadow and hover lift -->
      <div #swiperEl class="swiper !pt-4 !pb-14 !-mt-4 !-mb-14">
        <div class="swiper-wrapper">
          @for (chantier of chantiers(); track chantier.id) {
            <div class="swiper-slide !h-auto">
              <app-chantier-card [chantier]="chantier" [photoSwipe]="false" [eagerPhoto]="eager() && $index < 5"></app-chantier-card>
            </div>
          }
        </div>
      </div>

      <!-- Row controls: arrows beside the row from tablet up, under it with the dots on mobile -->
      <div class="mt-8 flex items-center justify-center gap-5">
        <button #prevEl type="button" class="chantier-slider__arrow md:absolute md:left-0 md:top-[calc(50%-2.75rem)]" aria-label="Chantiers précédents">
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
        </button>
        <div #paginationEl class="chantier-slider__dots flex items-center gap-2"></div>
        <button #nextEl type="button" class="chantier-slider__arrow md:absolute md:right-0 md:top-[calc(50%-2.75rem)]" aria-label="Chantiers suivants">
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
        </button>
      </div>
    </div>
  `,
  styles: `
    .chantier-slider__arrow {
      display: flex;
      height: 2.75rem;
      width: 2.75rem;
      align-items: center;
      justify-content: center;
      border-radius: 9999px;
      background: #fff;
      color: rgb(var(--sea-200));
      box-shadow: 0 10px 30px -10px rgba(20, 40, 70, 0.35);
      transition: background-color 0.3s ease, color 0.3s ease, opacity 0.3s ease;
    }
    .chantier-slider__arrow:hover { background: rgb(var(--sea-500)); color: #fff; }
    .chantier-slider__arrow.swiper-button-disabled { opacity: 0.35; pointer-events: none; }
    .chantier-slider__arrow.swiper-button-lock,
    .chantier-slider__dots.swiper-pagination-lock { display: none; }

    .chantier-slider__dot {
      display: block;
      height: 0.5rem;
      width: 0.5rem;
      border-radius: 9999px;
      background: rgb(var(--sea-500) / 0.25);
      cursor: pointer;
      transition: width 0.4s ease, background-color 0.4s ease;
    }
    .chantier-slider__dot--active { width: 1.75rem; background: rgb(var(--sea-500)); }
  `,
})
export class ChantierSliderComponent implements OnDestroy {
  chantiers = input.required<any[]>();
  /** Row shown as soon as the page opens: load its first photos right away */
  eager = input(false);

  private swiperEl = viewChild.required<ElementRef<HTMLElement>>('swiperEl');
  private prevEl = viewChild.required<ElementRef<HTMLElement>>('prevEl');
  private nextEl = viewChild.required<ElementRef<HTMLElement>>('nextEl');
  private paginationEl = viewChild.required<ElementRef<HTMLElement>>('paginationEl');
  private swiper?: Swiper;

  constructor() {
    afterNextRender(() => {
      this.swiper = new Swiper(this.swiperEl().nativeElement, {
        modules: [A11y, Navigation, Pagination],
        speed: 600,
        grabCursor: true,
        // Mobile shows a peek of the next card so it's clear the row scrolls
        slidesPerView: 1.15,
        spaceBetween: 16,
        // Cards per row follow the row's own width (not the screen), keeping each card at least ~270px wide: up to 5
        breakpointsBase: 'container',
        breakpoints: {
          560: { slidesPerView: 2, spaceBetween: 24 },
          880: { slidesPerView: 3, spaceBetween: 28 },
          1100: { slidesPerView: 4, spaceBetween: 24 },
          1440: { slidesPerView: 5, spaceBetween: 24 },
        },
        // A category with fewer projects than fit on screen stays centred, without arrows or dots
        centerInsufficientSlides: true,
        watchOverflow: true,
        navigation: {
          prevEl: this.prevEl().nativeElement,
          nextEl: this.nextEl().nativeElement,
        },
        pagination: {
          el: this.paginationEl().nativeElement,
          clickable: true,
          bulletClass: 'chantier-slider__dot',
          bulletActiveClass: 'chantier-slider__dot--active',
          renderBullet: (index, className) => `<button type="button" class="${className}" aria-label="Aller au chantier ${index + 1}"></button>`,
        },
        a11y: { prevSlideMessage: 'Chantiers précédents', nextSlideMessage: 'Chantiers suivants' },
      });
    });
  }

  ngOnDestroy() {
    this.swiper?.destroy(true, true);
  }
}
