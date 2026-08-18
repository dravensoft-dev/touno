export type Vertical = 'comida' | 'encomienda';

export type MerchantKind = 'restaurante' | 'importadora';

export interface Merchant {
  readonly slug: string;
  readonly name: string;
  readonly kind: MerchantKind;
  readonly city: string;
  readonly zone: string;
  readonly summary: string;
  readonly cover?: string;
  readonly rating: number;
  readonly reviewCount: number;
  readonly open: boolean;
  readonly prepMinutes: number;
  readonly deliveryBob: number;
  readonly categories: readonly string[];
  readonly tags: readonly string[];
}

export interface Variant {
  readonly id: string;
  readonly label: string;
  readonly deltaBob: number;
}

export interface Addon {
  readonly id: string;
  readonly label: string;
  readonly priceBob: number;
}

export interface Product {
  readonly id: string;
  readonly merchantSlug: string;
  readonly category: string;
  readonly name: string;
  readonly description: string;
  readonly priceBob: number;
  readonly photo?: string;
  readonly available: boolean;
  readonly featured: boolean;
  readonly soldThisMonth: number;
  readonly variants: readonly Variant[];
  readonly addons: readonly Addon[];
}
