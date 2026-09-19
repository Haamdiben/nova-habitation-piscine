import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ImageSliderComponent } from '../../components/image-slider/image-slider.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, ImageSliderComponent, NavbarComponent, FooterComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  loadingChantiers = signal(true);
  recentChantiers = signal<any[]>([]);

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.apiService.getChantiers().subscribe({
      next: (data) => {
        this.recentChantiers.set(data.slice(0, 3));
        this.loadingChantiers.set(false);
      },
      error: (err) => {
        console.error('Error loading recent chantiers:', err);
        this.loadingChantiers.set(false);
      },
    });
  }

  getPhotoUrl(filepath: string): string {
    return `http://localhost:3000/${filepath}`;
  }
}
