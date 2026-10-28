import { DOCUMENT, Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { socialLinks } from '../utils/social-links';

/** Public address of the site: canonical links and share previews must use it, not the current host */
export const SITE_URL = 'https://nova-habitat-piscine.fr';
const SITE_NAME = 'Nova Habitation et Piscine';
const DEFAULT_IMAGE = `${SITE_URL}/og-image.jpg`;

export interface PageSeo {
  title?: string;
  description?: string;
  /** Absolute URL of the image shown in share previews */
  image?: string;
}

/**
 * Keeps the search-engine and share-preview tags in sync with the current page:
 * canonical URL, description, Open Graph tags and robots (the admin is never indexed).
 * Pages set their description through the route's `data.description`; pages whose
 * content comes from the API (a chantier) call `update()` once it has loaded.
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private document = inject(DOCUMENT);
  private meta = inject(Meta);
  private title = inject(Title);
  private router = inject(Router);

  init() {
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => {
      let route: ActivatedRoute = this.router.routerState.root;
      while (route.firstChild) route = route.firstChild;
      const path = this.router.url.split(/[?#]/)[0];
      const isAdmin = path.startsWith('/admin');

      this.setCanonical(SITE_URL + (path === '/' ? '/' : path));
      this.meta.updateTag({ name: 'robots', content: isAdmin ? 'noindex, nofollow' : 'index, follow' });
      this.update({ title: this.title.getTitle(), description: route.snapshot.data['description'] });
    });
  }

  update({ title, description, image }: PageSeo) {
    if (title) {
      this.title.setTitle(title);
      this.meta.updateTag({ property: 'og:title', content: title });
    }
    if (description) {
      this.meta.updateTag({ name: 'description', content: description });
      this.meta.updateTag({ property: 'og:description', content: description });
    }
    this.meta.updateTag({ property: 'og:image', content: image || DEFAULT_IMAGE });
  }

  /** Company details for Google (local business card, contact information) */
  setBusinessInfo(info: any) {
    if (!info) return;
    const data = {
      '@context': 'https://schema.org',
      '@type': 'HomeAndConstructionBusiness',
      name: SITE_NAME,
      url: `${SITE_URL}/`,
      logo: `${SITE_URL}/logo-nova-1000.png`,
      image: DEFAULT_IMAGE,
      description: info.tagline || undefined,
      telephone: info.phone || undefined,
      email: info.email || undefined,
      address: {
        '@type': 'PostalAddress',
        addressLocality: info.city || undefined,
        postalCode: info.postalCode || undefined,
        addressCountry: 'FR',
      },
      sameAs: socialLinks(info).map((l) => l.url),
    };
    this.setJsonLd('business', data);
  }

  private setCanonical(url: string) {
    let link = this.document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.rel = 'canonical';
      this.document.head.appendChild(link);
    }
    link.href = url;
    this.meta.updateTag({ property: 'og:url', content: url });
  }

  private setJsonLd(id: string, data: object) {
    let script = this.document.getElementById(`ld-${id}`);
    if (!script) {
      script = this.document.createElement('script');
      script.id = `ld-${id}`;
      script.setAttribute('type', 'application/ld+json');
      this.document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(data);
  }
}
