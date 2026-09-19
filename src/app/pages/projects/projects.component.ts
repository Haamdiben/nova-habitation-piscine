import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss',
})
export class ProjectsComponent implements OnInit {
  loading = signal(true);
  realisations = signal<any[]>([]);

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadRealisations();
  }

  loadRealisations() {
    this.apiService.getRealisations().subscribe({
      next: (data) => {
        this.realisations.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading realisations:', err);
        this.loading.set(false);
      },
    });
  }

  realisationsByCategory() {
    const grouped: { [key: string]: any[] } = {};
    this.realisations().forEach((realisation) => {
      if (!grouped[realisation.category]) {
        grouped[realisation.category] = [];
      }
      grouped[realisation.category].push(realisation);
    });
    return grouped;
  }

  getPhotoUrl(filepath: string): string {
    return `http://localhost:3000/${filepath}`;
  }
}
