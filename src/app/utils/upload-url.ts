import { environment } from '../../environments/environment';

/** Full URL of a file stored by the backend (e.g. 'uploads/photo-123.jpg'). */
export function uploadUrl(filepath: string): string {
  return `${environment.backendUrl}/${filepath}`;
}
