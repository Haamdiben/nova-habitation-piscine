import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-image-slider',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-slider.component.html',
  styleUrl: './image-slider.component.scss',
})
export class ImageSliderComponent implements OnInit {
  currentSlide = signal(0);
  autoPlayInterval: any;

  slides = [
    { id: 1, image: '/1.webp', title: 'Piscine Travertin Contemporaine', description: 'Design moderne et élégant' },
    { id: 2, image: '/2.jpg', title: 'Piscine à Débordement', description: 'Luxe et technologie' },
    { id: 3, image: '/3.jpg', title: 'Rénovation Complète', description: 'Transformation professionnelle' },
  ];

  ngOnInit() {
    this.startAutoPlay();
  }

  nextSlide() {
    this.currentSlide.set((this.currentSlide() + 1) % this.slides.length);
  }

  prevSlide() {
    this.currentSlide.set((this.currentSlide() - 1 + this.slides.length) % this.slides.length);
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
    this.startAutoPlay();
  }

  ngOnDestroy() {
    clearInterval(this.autoPlayInterval);
  }
}
