import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';
import { HttpBackend } from '@angular/common/http';
import { SERVER_API_URL, ServerApiBackend } from './server-api-backend';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    // The NestJS backend, reached directly from the rendering server (not through nginx)
    { provide: SERVER_API_URL, useValue: process.env['API_INTERNAL_URL'] || 'http://127.0.0.1:3000' },
    { provide: HttpBackend, useClass: ServerApiBackend },
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
