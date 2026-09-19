import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-image-slider',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-slider.component.html',
  styleUrl: './image-slider.component.scss',
})
export class ImageSliderComponent implements OnInit, OnDestroy {
  currentSlide = signal(0);
  autoPlayInterval: any;

  loading = signal(true);
  slides = signal<any[]>([]);

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.apiService.getSlides().subscribe({
      next: (data) => {
        this.slides.set(data);
        this.loading.set(false);
        if (data.length > 1) {
          this.startAutoPlay();
        }
      },
      error: (err) => {
        console.error('Error loading slides:', err);
        this.loading.set(false);
      },
    });
  }

  nextSlide() {
    const total = this.slides().length;
    if (total === 0) return;
    this.currentSlide.set((this.currentSlide() + 1) % total);
  }

  prevSlide() {
    const total = this.slides().length;
    if (total === 0) return;
    this.currentSlide.set((this.currentSlide() - 1 + total) % total);
  }

  goToSlide(index: number) {
    this.currentSlide.set(index);
    this.resetAutoPlay();
  }

  startAutoPlay() {
    this.autoPlayInterval = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  resetAutoPlay() {
    clearInterval(this.autoPlayInterval);
    if (this.slides().length > 1) {
      this.startAutoPlay();
    }
  }

  getPhotoUrl(filepath: string): string {
    return `http://localhost:3000/${filepath}`;
  }

  ngOnDestroy() {
    clearInterval(this.autoPlayInterval);
  }
}
