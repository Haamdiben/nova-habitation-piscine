import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withViewTransitions, withInMemoryScrolling, ActivatedRouteSnapshot } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';

function snapshotPath(snapshot: ActivatedRouteSnapshot): string {
  // `onViewTransitionCreated` is given the *root* snapshot (not the leaf), whose
  // own `.url` is always empty — walk down through firstChild to rebuild the
  // actual path being navigated to/from.
  const segments: string[] = [];
  let node: ActivatedRouteSnapshot | null = snapshot;
  while (node) {
    const segment = node.url.map((s) => s.path).join('/');
    if (segment) segments.push(segment);
    node = node.firstChild;
  }
  return segments.join('/');
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withViewTransitions({
        // Skip the fade transition inside the admin dashboard: the sidenav is a
        // persistent layout there, and animating the whole page root on every
        // navigation made it look like the sidebar was reloading too.
        onViewTransitionCreated: ({ transition, to }) => {
          if (snapshotPath(to).startsWith('admin/dashboard')) {
            transition.skipTransition();
          }
        },
      }),
      withInMemoryScrolling({ scrollPositionRestoration: 'top' }),
    ),
    provideHttpClient(),
  ]
};
