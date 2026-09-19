import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FooterComponent],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
})
export class AboutComponent implements OnInit {
  info = signal<any>(null);

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.apiService.getAboutInfo().subscribe({
      next: (data) => this.info.set(data),
      error: (err) => console.error('Error loading about info:', err),
    });
  }
}
