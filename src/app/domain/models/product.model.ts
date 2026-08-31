import { ProductCategory } from '../enums/product-category.enum';

export interface Product {
  code: string;
  cat: ProductCategory;
  name: string;
  unit: string;
  costo: number;
  pvp: number;
  stock: number | null;
  spec: string;
  /** false = no aparece en el catálogo de cotización. */
  activo: boolean;
  /** URL mock; no se persisten binarios. */
  imagenUrl?: string;
}
