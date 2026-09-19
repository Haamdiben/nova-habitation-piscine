import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FooterComponent],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
})
export class ContactComponent implements OnInit {
  info = signal<any>(null);

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.apiService.getContactInfo().subscribe({
      next: (data) => this.info.set(data),
      error: (err) => console.error('Error loading contact info:', err),
    });
  }
}
