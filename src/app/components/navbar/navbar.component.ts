import { Component, HostListener, computed, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  /** Overlay the page (e.g. the home slider) and stay transparent until the user scrolls */
  transparent = input(false);

  isMenuOpen = signal(false);
  scrolled = signal(false);
  solid = computed(() => !this.transparent() || this.scrolled() || this.isMenuOpen());

  @HostListener('window:scroll')
  onScroll() {
    this.scrolled.set(window.scrollY > 40);
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.closeMenu();
  }

  skipToContent(event: Event) {
    // A plain #contenu link would be handled by the router; move the focus ourselves
    event.preventDefault();
    document.getElementById('contenu')?.focus();
  }

  toggleMenu() {
    this.isMenuOpen.set(!this.isMenuOpen());
  }

  closeMenu() {
    this.isMenuOpen.set(false);
  }
}
