import { Branch, Company } from './businesses.model';

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
  readonly companyId: string;
  readonly category: string;
  readonly name: string;
  readonly description: string;
  readonly priceBob: number;
  readonly photo?: string;
  readonly featured: boolean;
  readonly soldThisMonth: number;
  readonly variants: readonly Variant[];
  readonly addons: readonly Addon[];
}

export interface BranchStock {
  readonly branchId: string;
  readonly productId: string;
  readonly available: boolean;
}

export interface FeedItem {
  readonly product: Product;
  readonly branch: Branch;
  readonly company: Company;
}
