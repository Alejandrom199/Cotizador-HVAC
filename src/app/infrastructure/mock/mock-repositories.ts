import { inject, Injectable } from '@angular/core';
import { Quote } from '../../domain/models/quote.model';
import { Product } from '../../domain/models/product.model';
import { Client } from '../../domain/models/client.model';
import { SystemTemplate } from '../../domain/models/template.model';
import {
  ClientRepository,
  ProductRepository,
  QuoteRepository,
  StaffRepository,
  TemplateRepository,
} from '../../domain/ports/repositories';
import { MockWorkspaceStore } from './mock-workspace.store';

@Injectable()
export class MockQuoteRepository implements QuoteRepository {
  private readonly store = inject(MockWorkspaceStore);

  list(): Quote[] {
    return this.store.quotes();
  }

  getById(id: string): Quote | undefined {
    return this.store.quotes().find((q) => q.id === id);
  }

  upsert(quote: Quote): void {
    const exists = this.store.quotes().some((q) => q.id === quote.id);
    if (exists) {
      this.store.patchQuote(quote.id, () => quote);
      return;
    }
    this.store.insertQuote(quote);
  }
}

@Injectable()
export class MockProductRepository implements ProductRepository {
  private readonly store = inject(MockWorkspaceStore);

  list(): Product[] {
    return this.store.products();
  }

  getByCode(code: string): Product | undefined {
    return this.store.products().find((p) => p.code === code);
  }

  upsert(product: Product): void {
    this.store.upsertProduct(product);
  }
}

@Injectable()
export class MockClientRepository implements ClientRepository {
  private readonly store = inject(MockWorkspaceStore);

  list(): Client[] {
    return this.store.clients();
  }

  getByRuc(ruc: string): Client | undefined {
    return this.store.clients().find((c) => c.ruc === ruc);
  }

  upsert(client: Client): void {
    const exists = this.store.clients().some((c) => c.ruc === client.ruc);
    if (exists) {
      this.store.clients.update((list) => list.map((c) => (c.ruc === client.ruc ? client : c)));
      return;
    }
    this.store.insertClient(client);
  }
}

@Injectable()
export class MockTemplateRepository implements TemplateRepository {
  private readonly store = inject(MockWorkspaceStore);

  list(): SystemTemplate[] {
    return this.store.templates();
  }

  getByCode(code: string): SystemTemplate | undefined {
    return this.store.templates().find((t) => t.code === code);
  }

  upsert(template: SystemTemplate): void {
    this.store.upsertTemplate(template);
  }
}

@Injectable()
export class MockStaffRepository implements StaffRepository {
  private readonly store = inject(MockWorkspaceStore);

  sellers() {
    return this.store.sellers();
  }

  engineers() {
    return this.store.engineers();
  }
}
