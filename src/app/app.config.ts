import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';
import { environment } from '../environments/environment';
import { MOCK_PROVIDERS } from './infrastructure/mock/mock.providers';
import { HTTP_PROVIDERS } from './infrastructure/http/http.providers';
import { ICON_PROVIDERS } from './shared/ui/icon';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(),
    ...ICON_PROVIDERS,
    ...(environment.useMocks ? MOCK_PROVIDERS : HTTP_PROVIDERS),
  ],
};
