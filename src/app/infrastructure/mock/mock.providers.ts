import { Provider } from '@angular/core';
import {
  CLIENT_REPOSITORY,
  PRODUCT_REPOSITORY,
  QUOTE_REPOSITORY,
  QUOTE_SETTINGS,
  STAFF_REPOSITORY,
  TEMPLATE_REPOSITORY,
} from '../../domain/ports/tokens';
import { DEFAULT_QUOTE_SETTINGS } from '../../domain/settings/quote-settings';
import {
  MockClientRepository,
  MockProductRepository,
  MockQuoteRepository,
  MockStaffRepository,
  MockTemplateRepository,
} from './mock-repositories';

export const MOCK_PROVIDERS: Provider[] = [
  { provide: QUOTE_SETTINGS, useValue: DEFAULT_QUOTE_SETTINGS },
  { provide: QUOTE_REPOSITORY, useClass: MockQuoteRepository },
  { provide: PRODUCT_REPOSITORY, useClass: MockProductRepository },
  { provide: CLIENT_REPOSITORY, useClass: MockClientRepository },
  { provide: TEMPLATE_REPOSITORY, useClass: MockTemplateRepository },
  { provide: STAFF_REPOSITORY, useClass: MockStaffRepository },
];
