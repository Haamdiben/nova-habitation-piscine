import { environment } from '../../environments/environment';

/** Full URL of a file stored by the backend (e.g. 'uploads/photo-123.jpg'). */
export function uploadUrl(filepath: string): string {
  return `${environment.backendUrl}/${filepath}`;
}

/** Light version of an uploaded image, made by the backend on upload: 'uploads/photo-123.jpg' → 'uploads/thumbs/photo-123.webp' */
export function thumbUrl(filepath: string): string {
  const slash = filepath.lastIndexOf('/');
  const name = filepath.slice(slash + 1).replace(/\.[^.]+$/, '');
  return uploadUrl(`${filepath.slice(0, slash + 1)}thumbs/${name}.webp`);
}
