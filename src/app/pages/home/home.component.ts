import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ImageSliderComponent } from '../../components/image-slider/image-slider.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ChantierSliderComponent } from '../../components/chantier-slider/chantier-slider.component';
import { ServiceListComponent } from '../../components/service-list/service-list.component';
import { ReviewsComponent } from '../../components/reviews/reviews.component';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';
import { ApiService } from '../../services/api.service';
import { uploadUrl } from '../../utils/upload-url';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ImageSliderComponent,
    NavbarComponent,
    FooterComponent,
    ChantierSliderComponent,
    ServiceListComponent,
    ReviewsComponent,
    ScrollRevealDirective,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  loadingChantiers = signal(true);
  recentChantiers = signal<any[]>([]);
  aboutInfo = signal<any>(null);
  services = signal<any[]>([]);

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.apiService.getChantiers().subscribe({
      next: (data) => {
        // Home page showcase: the 5 most recent projects that have photos
        this.recentChantiers.set(data.filter((c) => c.photos?.length > 0).slice(0, 5));
        this.loadingChantiers.set(false);
      },
      error: (err) => {
        console.error('Error loading recent chantiers:', err);
        this.loadingChantiers.set(false);
      },
    });

    this.apiService.getAboutInfo().subscribe({
      next: (data) => this.aboutInfo.set(data),
      error: (err) => console.error('Error loading about info:', err),
    });

    this.apiService.getServices().subscribe({
      next: (data) => this.services.set(data),
      error: (err) => console.error('Error loading services:', err),
    });
  }

  getPhotoUrl(filepath: string): string {
    return uploadUrl(filepath);
  }

  getAboutPhotoUrl(): string {
    const path = this.aboutInfo()?.photoFilepath;
    return path ? this.getPhotoUrl(path) : '/logo-nova-600.png';
  }
}
