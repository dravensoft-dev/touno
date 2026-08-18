import { Injectable, computed, signal } from '@angular/core';
import { Merchant, MerchantKind, Product } from './marketplace.model';
import { MERCHANTS } from './marketplace.data';
import { PRODUCTS } from './products.data';

@Injectable({ providedIn: 'root' })
export class Marketplace {
  private readonly merchants = signal<readonly Merchant[]>(MERCHANTS);
  private readonly products = signal<readonly Product[]>(PRODUCTS);

  readonly all = this.merchants.asReadonly();

  readonly restaurants = computed(() => this.all().filter((one) => one.kind === 'restaurante'));

  readonly importers = computed(() => this.all().filter((one) => one.kind === 'importadora'));

  readonly featured = computed(() =>
    this.all()
      .filter((one) => one.open)
      .slice(0, 6),
  );

  readonly cities = computed(() => [...new Set(this.all().map((one) => one.city))].sort());

  byKind(kind: MerchantKind): readonly Merchant[] {
    return this.all().filter((one) => one.kind === kind);
  }

  bySlug(slug: string): Merchant | undefined {
    return this.all().find((one) => one.slug === slug);
  }

  catalogOf(slug: string): readonly Product[] {
    return this.products().filter((one) => one.merchantSlug === slug);
  }

  categoriesOf(slug: string): readonly string[] {
    return this.bySlug(slug)?.categories ?? [];
  }

  productById(id: string): Product | undefined {
    return this.products().find((one) => one.id === id);
  }

  topSellers(slug: string, limit = 5): readonly Product[] {
    return [...this.catalogOf(slug)]
      .sort((left, right) => right.soldThisMonth - left.soldThisMonth)
      .slice(0, limit);
  }

  setAvailability(id: string, available: boolean): void {
    this.products.update((list) =>
      list.map((one) => (one.id === id ? { ...one, available } : one)),
    );
  }

  setOpen(slug: string, open: boolean): void {
    this.merchants.update((list) =>
      list.map((one) => (one.slug === slug ? { ...one, open } : one)),
    );
  }
}
