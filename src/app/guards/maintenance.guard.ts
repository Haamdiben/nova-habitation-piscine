import { inject } from '@angular/core';
import { CanMatchFn } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { ApiService } from '../services/api.service';

/** Matches every public URL while maintenance mode is on (never the admin), so visitors get the maintenance page */
export const maintenanceGuard: CanMatchFn = (_route, segments) => {
  if (segments[0]?.path === 'admin') return false;
  return inject(ApiService)
    .getSiteSettings()
    .pipe(
      map((settings) => settings.maintenance),
      catchError(() => of(false)),
    );
};
