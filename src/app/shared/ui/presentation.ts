import { QuoteStatus } from '../../domain/enums/quote-status.enum';
import { Priority } from '../../domain/enums/priority.enum';
import { QuoteKind } from '../../domain/enums/quote-kind.enum';
import { ProductCategory } from '../../domain/enums/product-category.enum';

export function statusClass(status: QuoteStatus | string): string {
  return 'status st-' + String(status).toLowerCase();
}

export function priorityClass(priority: Priority | string): string {
  return 'prio prio-' + String(priority).toLowerCase();
}

export function kindClass(kind: QuoteKind | string): string {
  return kind === QuoteKind.Mantenimiento ? 'tipo-box tipo-mant' : 'tipo-box tipo-inst';
}

export function kindTag(kind: QuoteKind | string): string {
  return kind === QuoteKind.Mantenimiento ? 'MANT' : 'INST';
}

export function categoryClass(cat: ProductCategory | string): string {
  const map: Record<string, string> = {
    Equipos: 'chip',
    Insumos: 'stock ok',
    'Mano de Obra': 'stock',
    Logística: 'stock warn',
  };
  return map[cat] ?? 'chip';
}

export function stockClass(stock: number | null): string {
  if (stock == null) {
    return '';
  }
  if (stock === 0) {
    return 'stock bad';
  }
  if (stock < 5) {
    return 'stock warn';
  }
  return 'stock ok';
}
