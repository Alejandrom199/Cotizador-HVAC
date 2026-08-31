import { InjectionToken } from '@angular/core';
import {
  ClientRepository,
  ProductRepository,
  QuoteRepository,
  StaffRepository,
  TemplateRepository,
} from './repositories';
import { QuoteSettings } from '../settings/quote-settings';

export const QUOTE_REPOSITORY = new InjectionToken<QuoteRepository>('QUOTE_REPOSITORY');
export const PRODUCT_REPOSITORY = new InjectionToken<ProductRepository>('PRODUCT_REPOSITORY');
export const CLIENT_REPOSITORY = new InjectionToken<ClientRepository>('CLIENT_REPOSITORY');
export const TEMPLATE_REPOSITORY = new InjectionToken<TemplateRepository>('TEMPLATE_REPOSITORY');
export const STAFF_REPOSITORY = new InjectionToken<StaffRepository>('STAFF_REPOSITORY');
export const QUOTE_SETTINGS = new InjectionToken<QuoteSettings>('QUOTE_SETTINGS');
