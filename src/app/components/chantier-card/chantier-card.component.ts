import {
  Component,
  ElementRef,
  OnDestroy,
  ViewEncapsulation,
  afterNextRender,
  input,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import Swiper from 'swiper';
import { A11y, Autoplay, Navigation, Pagination } from 'swiper/modules';
import { ThumbDirective } from '../../directives/thumb.directive';

/** Time each photo stays on screen in a card's slider */
const PHOTO_AUTOPLAY_DELAY = 3000;

/** Project ("chantier") card with its own photo slider, used on the home page and the réalisations page. */
@Component({
  selector: 'app-chantier-card',
  standalone: true,
  imports: [RouterLink, ThumbDirective],
  host: { class: 'block on-dark' },
  // Swiper adds its classes at runtime, so styles must not be view-encapsulated (they're scoped by class name)
  encapsulation: ViewEncapsulation.None,
  template: `
    @let c = chantier();
    <div
      class="group relative h-[30rem] md:h-[34rem] overflow-hidden rounded-3xl bg-ink-700 shadow-[0_14px_40px_-18px_rgba(8,18,32,0.45)]
        transition-all duration-500 ease-out hover:-translate-y-1.5 hover:shadow-[0_28px_60px_-20px_rgba(8,18,32,0.55)]"
    >
      @if (c.photos?.length) {
        <div #swiperEl class="swiper h-full w-full">
          <div class="swiper-wrapper">
            @for (photo of c.photos; track photo.id ?? $index) {
              <!-- Swiper gives slides role="group", which a link can't have: the link goes inside -->
              <div class="swiper-slide h-full">
                <a class="block h-full" [routerLink]="['/chantier', c.id]" tabindex="-1">
                  <img
                    [appThumb]="photo.filepath"
                    [alt]="c.title + ' — photo ' + ($index + 1)"
                    [attr.loading]="eagerPhoto() && $first ? 'eager' : 'lazy'"
                    class="w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
                  />
                </a>
              </div>
            }
          </div>
        </div>
      }
      <div class="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-ink via-ink/20 to-transparent"></div>

      @if (c.photos?.length > 1) {
        <!-- Arrows -->
        <button #prevEl type="button" class="chantier-card__arrow left-4" aria-label="Photo précédente">
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
        </button>
        <button #nextEl type="button" class="chantier-card__arrow right-4" aria-label="Photo suivante">
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
        </button>
      }

      <div class="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex flex-col items-center p-7 text-center">
        <h3 class="font-display text-xl md:text-2xl leading-tight text-sea-400">{{ c.title }}</h3>
        @if (!c.photos?.length) {
          <p class="text-sm text-sea-100/75 mt-2">Pas de photos disponibles</p>
        }
        <a
          [routerLink]="['/chantier', c.id]"
          class="pointer-events-auto mt-5 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-[0.7rem] uppercase tracking-[0.2em] text-white ring-1 ring-white/25 backdrop-blur-md
            transition-all duration-500 hover:bg-white hover:text-[#14345c] hover:ring-white"
        >
          Découvrir
          <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M13 6l6 6-6 6"></path>
          </svg>
        </a>
        <!-- Photo dots under the button (space kept on single-photo cards so titles line up) -->
        <div #paginationEl class="chantier-card__dots pointer-events-auto mt-4 flex h-1.5 items-center justify-center gap-1.5"></div>
      </div>
    </div>
  `,
  styles: `
    .chantier-card__arrow {
      position: absolute;
      top: 50%;
      z-index: 10;
      display: flex;
      height: 2.5rem;
      width: 2.5rem;
      align-items: center;
      justify-content: center;
      border-radius: 9999px;
      color: #fff;
      background: rgb(255 255 255 / 0.15);
      box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.3);
      backdrop-filter: blur(8px);
      transform: translateY(-50%);
      transition: background-color 0.3s ease, color 0.3s ease;
    }
    .chantier-card__arrow:hover { background: #fff; color: #14345c; }

    .chantier-card__dot {
      display: block;
      height: 0.375rem;
      width: 0.375rem;
      border-radius: 9999px;
      background: rgb(255 255 255 / 0.5);
      cursor: pointer;
      transition: width 0.4s ease, background-color 0.4s ease;
    }
    .chantier-card__dot--active { width: 1.25rem; background: #fff; }
  `,
})
export class ChantierCardComponent implements OnDestroy {
  chantier = input.required<any>();
  /** Allow swiping between photos; turned off when the card sits inside a swipeable row */
  photoSwipe = input(true);
  /** Load the first photo right away (cards visible as soon as the page opens) */
  eagerPhoto = input(false);

  private swiperEl = viewChild<ElementRef<HTMLElement>>('swiperEl');
  private paginationEl = viewChild<ElementRef<HTMLElement>>('paginationEl');
  private prevEl = viewChild<ElementRef<HTMLElement>>('prevEl');
  private nextEl = viewChild<ElementRef<HTMLElement>>('nextEl');
  private swiper?: Swiper;

  constructor() {
    afterNextRender(() => {
      const el = this.swiperEl()?.nativeElement;
      if (!el || (this.chantier().photos?.length ?? 0) < 2) return;

      this.swiper = new Swiper(el, {
        modules: [A11y, Autoplay, Navigation, Pagination],
        speed: 700,
        rewind: true,
        autoplay: { delay: PHOTO_AUTOPLAY_DELAY, disableOnInteraction: false },
        allowTouchMove: this.photoSwipe(),
        grabCursor: this.photoSwipe(),
        navigation: {
          prevEl: this.prevEl()?.nativeElement,
          nextEl: this.nextEl()?.nativeElement,
        },
        pagination: {
          el: this.paginationEl()?.nativeElement,
          clickable: true,
          bulletClass: 'chantier-card__dot',
          bulletActiveClass: 'chantier-card__dot--active',
          renderBullet: (index, className) => `<button type="button" class="${className}" aria-label="Photo ${index + 1}"></button>`,
        },
        a11y: { prevSlideMessage: 'Photo précédente', nextSlideMessage: 'Photo suivante' },
      });
    });
  }

  ngOnDestroy() {
    this.swiper?.destroy(true, true);
  }
}
