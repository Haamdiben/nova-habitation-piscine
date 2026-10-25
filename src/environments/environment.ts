// Production build (`ng build`).
// Empty backendUrl = same domain as the site: the web server must forward
// /api and /uploads to the NestJS backend. If the backend lives on another
// domain, put its full URL here instead (e.g. 'https://api.example.fr').
export const environment = {
  backendUrl: '',
};
