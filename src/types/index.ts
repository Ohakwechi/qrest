// src/types/index.ts
export type StrainType = 'Sativa' | 'Indica' | 'Hybrid';
export type CategoryType = 'Flower' | 'Concentrates' | 'Edibles';

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: CategoryType;
  strain: StrainType;
  thc: number;
  cbd: number;
  price: number;
  weight: string; // e.g., "3.5g", "100mg"
  image: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}