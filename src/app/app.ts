import { Component, DOCUMENT, inject } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet></router-outlet>',
})
export class App {
  constructor() {
    const html = inject(DOCUMENT).documentElement;
    // Site theme on the public pages; the admin back office keeps its own light theme
    inject(Router)
      .events.pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe((e) => {
        html.classList.toggle('site-theme', !e.urlAfterRedirects.startsWith('/admin'));
      });
  }
}
