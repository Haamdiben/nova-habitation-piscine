import { FetchBackend, HttpBackend, HttpEvent, HttpRequest } from '@angular/common/http';
import { Injectable, InjectionToken, inject } from '@angular/core';
import { Observable } from 'rxjs';

/** Backend address used while a page is rendered on the server */
export const SERVER_API_URL = new InjectionToken<string>('SERVER_API_URL');

/**
 * Server-side HTTP backend. In production the API is called with relative URLs (/api/...);
 * during server rendering Angular turns them into the public site address, which would send
 * the request out through the internet (and nginx) for nothing. Every /api/ request is sent
 * straight to the backend instead. Rewriting at this last step (rather than in an interceptor)
 * leaves the URL that Angular's transfer cache records untouched, so the browser reuses the
 * data fetched during server rendering instead of loading it again.
 */
@Injectable()
export class ServerApiBackend implements HttpBackend {
  private fetchBackend = inject(FetchBackend);
  private baseUrl = inject(SERVER_API_URL);

  handle(req: HttpRequest<any>): Observable<HttpEvent<any>> {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname.startsWith('/api/')) {
      return this.fetchBackend.handle(req.clone({ url: this.baseUrl + url.pathname + url.search }));
    }
    return this.fetchBackend.handle(req);
  }
}
