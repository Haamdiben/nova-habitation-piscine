import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
  afterRenderEffect,
  computed,
  signal,
  viewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin, of, catchError } from 'rxjs';
import Swiper from 'swiper';
import { A11y, Autoplay, EffectFade, Keyboard, Navigation } from 'swiper/modules';
import { ApiService } from '../../services/api.service';
import { uploadUrl } from '../../utils/upload-url';
import { loadYouTubeApi, youTubeThumbnail } from '../../utils/youtube-api';

const AUTOPLAY_DELAY = 6000;
/** Move on if the video hasn't started playing after this long (blocked, offline…) */
const VIDEO_START_TIMEOUT = 10000;

@Component({
  selector: 'app-image-slider',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-slider.component.html',
  styleUrl: './image-slider.component.scss',
  // Swiper adds its classes at runtime, so styles must not be view-encapsulated
  encapsulation: ViewEncapsulation.None,
})
export class ImageSliderComponent implements OnInit, OnDestroy {
  readonly autoplayDelay = AUTOPLAY_DELAY;

  loading = signal(true);
  slides = signal<any[]>([]);
  /** YouTube video shown as the first slide, set from the back office ('' = photos only) */
  videoId = signal('');
  videoPoster = computed(() => (this.videoId() ? youTubeThumbnail(this.videoId()) : ''));
  currentSlide = signal(0);
  totalSlides = computed(() => this.slides().length + (this.videoId() ? 1 : 0));

  videoPlaying = signal(false);
  videoDuration = signal(0);

  private swiperEl = viewChild<ElementRef<HTMLElement>>('swiperEl');
  private prevEl = viewChild<ElementRef<HTMLElement>>('prevEl');
  private nextEl = viewChild<ElementRef<HTMLElement>>('nextEl');
  private videoEl = viewChild<ElementRef<HTMLElement>>('videoEl');
  private swiper?: Swiper;
  private player?: any;
  private videoTimeout?: ReturnType<typeof setTimeout>;

  constructor(private apiService: ApiService) {
    // Init Swiper once the slides are in the DOM
    afterRenderEffect(() => {
      const el = this.swiperEl()?.nativeElement;
      if (!el || this.swiper || this.totalSlides() === 0) return;
      this.initSwiper(el);
      this.initVideo();
    });
  }

  ngOnInit() {
    forkJoin({
      slides: this.apiService.getSlides(),
      // The slider still works with photos only if the settings can't be loaded
      settings: this.apiService.getSliderSettings().pipe(catchError(() => of({ videoId: '' }))),
    }).subscribe({
      next: ({ slides, settings }) => {
        this.slides.set(slides);
        this.videoId.set(settings.videoId);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading slides:', err);
        this.loading.set(false);
      },
    });
  }

  private initSwiper(el: HTMLElement) {
    const multiple = this.totalSlides() > 1;

    this.swiper = new Swiper(el, {
      modules: [A11y, Autoplay, EffectFade, Keyboard, Navigation],
      effect: 'fade',
      fadeEffect: { crossFade: true },
      speed: 1200,
      // With a fade, rewinding looks the same as looping and works with any number of slides
      rewind: multiple,
      allowTouchMove: multiple,
      grabCursor: multiple,
      keyboard: { enabled: true },
      autoplay: multiple
        ? { delay: AUTOPLAY_DELAY, disableOnInteraction: false, pauseOnMouseEnter: true }
        : false,
      navigation: {
        prevEl: this.prevEl()?.nativeElement,
        nextEl: this.nextEl()?.nativeElement,
      },
      a11y: {
        prevSlideMessage: 'Diapositive précédente',
        nextSlideMessage: 'Diapositive suivante',
      },
      on: {
        slideChange: (s) => {
          this.currentSlide.set(s.activeIndex);
          this.onVideoSlideChange();
        },
      },
    });
  }

  private initVideo() {
    const el = this.videoEl()?.nativeElement;
    if (!el) return;

    this.armVideoTimeout();
    loadYouTubeApi().then((YT) => {
      this.player = new YT.Player(el, {
        videoId: this.videoId(),
        host: 'https://www.youtube-nocookie.com',
        playerVars: {
          autoplay: 1,
          mute: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          playsinline: 1,
          rel: 0,
        },
        events: {
          onReady: (e: any) => {
            e.target.mute();
            if (this.isOnVideo()) e.target.playVideo();
          },
          onStateChange: (e: any) => {
            if (e.data === YT.PlayerState.PLAYING) {
              clearTimeout(this.videoTimeout);
              this.videoDuration.set(e.target.getDuration());
              this.videoPlaying.set(true);
            } else if (e.data === YT.PlayerState.ENDED) {
              this.videoPlaying.set(false);
              if (this.totalSlides() > 1) {
                this.swiper?.slideNext();
              } else {
                e.target.seekTo(0);
                e.target.playVideo();
              }
            }
          },
          onError: () => this.skipVideo(),
        },
      });
    });
  }

  /** Play the video from the start on its slide, pause it elsewhere */
  private onVideoSlideChange() {
    if (!this.videoId()) return;
    clearTimeout(this.videoTimeout);
    this.videoPlaying.set(false);

    if (this.isOnVideo()) {
      this.armVideoTimeout();
      this.player?.seekTo?.(0);
      this.player?.playVideo?.();
    } else {
      this.player?.pauseVideo?.();
    }
  }

  private armVideoTimeout() {
    this.videoTimeout = setTimeout(() => this.skipVideo(), VIDEO_START_TIMEOUT);
  }

  private skipVideo() {
    if (this.isOnVideo() && this.totalSlides() > 1) this.swiper?.slideNext();
  }

  private isOnVideo(): boolean {
    return !!this.videoId() && (this.swiper?.activeIndex ?? 0) === 0;
  }

  isBulletActive(index: number): boolean {
    if (this.currentSlide() !== index) return false;
    // The video's bar only starts filling once playback has actually started
    return !(this.videoId() && index === 0) || this.videoPlaying();
  }

  goToSlide(index: number) {
    this.swiper?.slideTo(index);
  }

  pad(n: number): string {
    return String(n).padStart(2, '0');
  }

  getPhotoUrl(filepath: string): string {
    return uploadUrl(filepath);
  }

  ngOnDestroy() {
    clearTimeout(this.videoTimeout);
    this.player?.destroy?.();
    this.swiper?.destroy(true, true);
  }
}
