import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // The back office needs the admin's session (stored in the browser): render it there only
  { path: 'admin/**', renderMode: RenderMode.Client },
  // Public pages are rendered on each visit, so search engines and link previews always get
  // the full, current content (chantiers, texts and photos change from the admin)
  { path: '**', renderMode: RenderMode.Server },
];
