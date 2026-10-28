import { Component, DOCUMENT, inject } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { ApiService } from './services/api.service';
import { SeoService } from './services/seo.service';

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

    const seo = inject(SeoService);
    seo.init();
    inject(ApiService)
      .getContactInfo()
      .subscribe({ next: (info) => seo.setBusinessInfo(info), error: () => {} });
  }
}
