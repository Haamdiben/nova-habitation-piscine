import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';
import { ApiService } from '../../services/api.service';

const EMPTY_FORM = {
  name: '',
  email: '',
  phone: '',
  projectType: '',
  message: '',
  consent: false,
  website: '',
};

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NavbarComponent, FooterComponent, ScrollRevealDirective],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
})
export class ContactComponent implements OnInit {
  info = signal<any>(null);
  form = { ...EMPTY_FORM };
  projectTypes = [
    'Construction de piscine',
    'Rénovation de piscine',
    'Rénovation de bâtiment',
    'Peinture et finitions',
    'Autre',
  ];
  sending = signal(false);
  sent = signal(false);
  errorMessage = signal('');

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.apiService.getContactInfo().subscribe({
      next: (data) => this.info.set(data),
      error: (err) => console.error('Error loading contact info:', err),
    });
  }

  submit(contactForm: NgForm) {
    if (contactForm.invalid) {
      contactForm.control.markAllAsTouched();
      this.errorMessage.set(
        this.form.consent
          ? 'Merci de remplir tous les champs obligatoires (*) avec une adresse email valide.'
          : 'Merci de remplir les champs obligatoires (*) et d\'accepter l\'utilisation de vos données.',
      );
      return;
    }

    this.sending.set(true);
    this.errorMessage.set('');
    this.apiService.sendContactMessage(this.form).subscribe({
      next: () => {
        this.sending.set(false);
        this.sent.set(true);
        this.form = { ...EMPTY_FORM };
        contactForm.resetForm(this.form);
      },
      error: (err) => {
        this.sending.set(false);
        this.errorMessage.set(
          err.status === 429
            ? 'Trop de messages envoyés. Merci de réessayer dans quelques minutes.'
            : 'L\'envoi a échoué. Merci de réessayer ou de nous contacter par téléphone ou email.',
        );
      },
    });
  }
}
