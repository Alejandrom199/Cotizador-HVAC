import { Injectable, signal } from '@angular/core';
import { Quote } from '../../domain/models/quote.model';
import { Product } from '../../domain/models/product.model';
import { Client } from '../../domain/models/client.model';
import { SystemTemplate } from '../../domain/models/template.model';
import { StaffMember } from '../../domain/models/results.model';
import {
  createSeedQuotes,
  SEED_CLIENTS,
  SEED_ENGINEERS,
  SEED_PRODUCTS,
  SEED_SELLERS,
  SEED_TEMPLATES,
} from './seed-data';

/**
 * Persistencia in-memory del adaptador mock.
 * Un solo store para no duplicar verdades entre repositorios.
 */
@Injectable({ providedIn: 'root' })
export class MockWorkspaceStore {
  readonly quotes = signal<Quote[]>(createSeedQuotes());
  readonly products = signal<Product[]>(SEED_PRODUCTS.map((p) => ({ ...p, activo: true })));
  readonly clients = signal<Client[]>(SEED_CLIENTS.map((c) => ({ ...c })));
  readonly templates = signal<SystemTemplate[]>(SEED_TEMPLATES.map((t) => ({ ...t, items: [...t.items] })));
  readonly sellers = signal<StaffMember[]>(SEED_SELLERS);
  readonly engineers = signal<StaffMember[]>(SEED_ENGINEERS);

  patchQuote(id: string, mutate: (quote: Quote) => Quote): Quote | undefined {
    let next: Quote | undefined;
    this.quotes.update((list) =>
      list.map((quote) => {
        if (quote.id !== id) {
          return quote;
        }
        next = mutate({ ...quote, rooms: [...quote.rooms], elements: [...quote.elements], hrs: [...quote.hrs], log: [...quote.log] });
        return next;
      }),
    );
    return next;
  }

  insertQuote(quote: Quote): void {
    this.quotes.update((list) => [quote, ...list]);
  }

  insertClient(client: Client): void {
    this.clients.update((list) => [client, ...list]);
  }

  upsertProduct(product: Product): void {
    const exists = this.products().some((p) => p.code === product.code);
    if (exists) {
      this.products.update((list) => list.map((p) => (p.code === product.code ? product : p)));
      return;
    }
    this.products.update((list) => [product, ...list]);
  }

  upsertTemplate(template: SystemTemplate): void {
    const next: SystemTemplate = { ...template, items: [...template.items] };
    const exists = this.templates().some((t) => t.code === next.code);
    if (exists) {
      this.templates.update((list) => list.map((t) => (t.code === next.code ? next : t)));
      return;
    }
    this.templates.update((list) => [...list, next]);
  }
}
