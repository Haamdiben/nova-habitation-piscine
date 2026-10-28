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
/** Move on if the video still isn't showing after this long (blocked, offline, endless buffering…) */
const VIDEO_START_TIMEOUT = 15000;
/** YouTube shows its title/logo/"more videos" overlay for the first ~3.5s of playback; keep the poster on top meanwhile */
const VIDEO_REVEAL_TIME = 4.5; // seconds of actual playback, so buffering doesn't count
/** Loader fill (%) reached once the player is ready; the rest follows the video's playback */
const LOADER_READY_FILL = 35;

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
  /** True once YouTube's start-up overlay has gone, so the iframe can be shown */
  videoRevealed = signal(false);
  videoDuration = signal(0);

  /** How much of the logo loader is filled (%), and how long the fill takes to get there */
  videoProgress = signal(0);
  videoProgressDuration = signal(0);
  /** Logo loader stays up while the slides load and until the opening video is actually visible */
  showLoader = computed(
    () => this.loading() || (!!this.videoId() && this.currentSlide() === 0 && !this.videoRevealed()),
  );

  private swiperEl = viewChild<ElementRef<HTMLElement>>('swiperEl');
  private prevEl = viewChild<ElementRef<HTMLElement>>('prevEl');
  private nextEl = viewChild<ElementRef<HTMLElement>>('nextEl');
  private videoEl = viewChild<ElementRef<HTMLElement>>('videoEl');
  private swiper?: Swiper;
  private player?: any;
  private videoTimeout?: ReturnType<typeof setTimeout>;
  private revealPoll?: ReturnType<typeof setInterval>;
  /** Seconds the video has really played since it last started, and the position at the last check */
  private playedTime = 0;
  private lastPlayerTime = 0;

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
    // Start filling just after the empty logo has been painted
    setTimeout(() => this.setVideoProgress(15, 1500), 50);
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
    this.setVideoProgress(LOADER_READY_FILL - 5, 3000);
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
            this.setVideoProgress(LOADER_READY_FILL, 800);
            if (this.isOnVideo()) e.target.playVideo();
          },
          onStateChange: (e: any) => {
            if (e.data === YT.PlayerState.PLAYING) {
              this.videoDuration.set(e.target.getDuration());
              this.setVideoPlaying(true);
            } else if (e.data === YT.PlayerState.PAUSED) {
              // Paused by the browser (power saving, tab switch…): hide YouTube's pause UI behind
              // the poster and resume, moving on to the photos if it can't
              this.setVideoPlaying(false);
              if (this.isOnVideo()) {
                clearTimeout(this.videoTimeout);
                this.armVideoTimeout();
                e.target.playVideo();
              }
            } else if (e.data === YT.PlayerState.ENDED) {
              this.setVideoPlaying(false);
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
    this.setVideoPlaying(false);

    if (this.isOnVideo()) {
      this.armVideoTimeout();
      this.setVideoProgress(LOADER_READY_FILL, 0);
      this.player?.seekTo?.(0);
      this.player?.playVideo?.();
    } else {
      this.player?.pauseVideo?.();
    }
  }

  private setVideoPlaying(playing: boolean) {
    // PLAYING fires again after each buffering pause: keep measuring from the original start
    if (playing === this.videoPlaying()) return;
    this.videoPlaying.set(playing);
    clearInterval(this.revealPoll);
    if (playing) {
      this.playedTime = 0;
      this.lastPlayerTime = this.player?.getCurrentTime?.() ?? 0;
      this.revealPoll = setInterval(() => this.trackVideoStart(), 200);
    } else {
      this.videoRevealed.set(false);
    }
  }

  /** Fill the logo with the video's real playback time and show the video once YouTube's overlay is gone */
  private trackVideoStart() {
    const time = this.player?.getCurrentTime?.() ?? 0;
    const step = time - this.lastPlayerTime;
    this.lastPlayerTime = time;
    // Only count small forward steps: seeks (back to 0, or skipping ahead) aren't playback
    if (step > 0 && step < 2) this.playedTime += step;
    const ratio = Math.min(this.playedTime / VIDEO_REVEAL_TIME, 1);
    this.setVideoProgress(LOADER_READY_FILL + (100 - LOADER_READY_FILL) * ratio, 250);
    if (ratio === 1) {
      clearInterval(this.revealPoll);
      clearTimeout(this.videoTimeout);
      this.videoRevealed.set(true);
    }
  }

  private setVideoProgress(value: number, durationMs: number) {
    this.videoProgressDuration.set(durationMs);
    this.videoProgress.set(value);
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

  getPhotoUrl(filepath: string): string {
    return uploadUrl(filepath);
  }

  ngOnDestroy() {
    clearTimeout(this.videoTimeout);
    clearInterval(this.revealPoll);
    this.player?.destroy?.();
    this.swiper?.destroy(true, true);
  }
}
