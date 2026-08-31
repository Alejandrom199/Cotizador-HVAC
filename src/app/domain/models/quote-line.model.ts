import { ProductCategory } from '../enums/product-category.enum';

export interface QuoteLine {
  uid: string;
  code: string;
  name: string;
  cat: ProductCategory;
  unit: string;
  costo: number;
  pvp: number;
  qty: number;
}
