import { Quote } from '../models/quote.model';
import { Product } from '../models/product.model';
import { Client } from '../models/client.model';
import { SystemTemplate } from '../models/template.model';
import { StaffMember } from '../models/results.model';

export interface QuoteRepository {
  list(): Quote[];
  getById(id: string): Quote | undefined;
  upsert(quote: Quote): void;
}

export interface ProductRepository {
  list(): Product[];
  getByCode(code: string): Product | undefined;
  upsert(product: Product): void;
}

export interface ClientRepository {
  list(): Client[];
  getByRuc(ruc: string): Client | undefined;
  upsert(client: Client): void;
}

export interface TemplateRepository {
  list(): SystemTemplate[];
  getByCode(code: string): SystemTemplate | undefined;
  upsert(template: SystemTemplate): void;
}

export interface StaffRepository {
  sellers(): StaffMember[];
  engineers(): StaffMember[];
}
