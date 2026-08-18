import { Injectable, computed, signal } from '@angular/core';
import { FeedItem, Merchant, MerchantKind, Product } from './marketplace.model';
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

  readonly foodFeed = computed(() => this.feedOf('restaurante'));

  readonly parcelFeed = computed(() => this.feedOf('importadora'));

  readonly cities = computed(() => [...new Set(this.all().map((one) => one.city))].sort());

  private feedOf(kind: MerchantKind): readonly FeedItem[] {
    const queues = this.all()
      .filter((one) => one.kind === kind && one.open)
      .sort((left, right) => right.rating - left.rating || left.name.localeCompare(right.name))
      .map((merchant) =>
        this.catalogOf(merchant.slug)
          .filter((one) => one.available)
          .sort(
            (left, right) =>
              Number(right.featured) - Number(left.featured) ||
              right.soldThisMonth - left.soldThisMonth,
          )
          .map((product) => ({ product, merchant })),
      );

    const deepest = queues.reduce((most, queue) => Math.max(most, queue.length), 0);
    const feed: FeedItem[] = [];

    for (let round = 0; round < deepest; round += 1) {
      for (const queue of queues) {
        const item = queue[round];

        if (item) {
          feed.push(item);
        }
      }
    }

    return feed;
  }

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
