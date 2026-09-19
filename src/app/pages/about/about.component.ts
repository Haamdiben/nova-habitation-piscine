import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FooterComponent, ScrollRevealDirective],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
})
export class AboutComponent implements OnInit {
  info = signal<any>(null);
  services = signal<any[]>([]);

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.apiService.getAboutInfo().subscribe({
      next: (data) => this.info.set(data),
      error: (err) => console.error('Error loading about info:', err),
    });

    this.apiService.getServices().subscribe({
      next: (data) => this.services.set(data),
      error: (err) => console.error('Error loading services:', err),
    });
  }

  splitFeatures(features: string): string[] {
    return (features || '').split('\n').map((f) => f.trim()).filter((f) => f.length > 0);
  }

  getAboutPhotoUrl(): string {
    const path = this.info()?.photoFilepath;
    return path ? `http://localhost:3000/${path}` : '/logo-nova-600.png';
  }
}
