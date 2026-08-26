import { Injectable, computed, inject, signal } from '@angular/core';
import { Businesses } from './businesses';
import { Branch, BusinessType } from './businesses.model';
import { BranchPrice, BranchStock, FeedItem, PriceScope, Product } from './catalog.model';
import { BRANCH_PRICES, BRANCH_STOCK, PRODUCTS } from './catalog.data';

@Injectable({ providedIn: 'root' })
export class Catalog {
  private readonly businesses = inject(Businesses);

  private readonly productList = signal<readonly Product[]>(PRODUCTS);
  private readonly stockList = signal<readonly BranchStock[]>(BRANCH_STOCK);
  private readonly priceList = signal<readonly BranchPrice[]>(BRANCH_PRICES);

  readonly products = this.productList.asReadonly();

  readonly stock = this.stockList.asReadonly();

  readonly branchPrices = this.priceList.asReadonly();

  readonly foodFeed = computed(() => this.feedOf('restaurante'));

  readonly parcelFeed = computed(() => this.feedOf('importadora'));

  byId(id: string): Product | undefined {
    return this.products().find((one) => one.id === id);
  }

  ofCompany(companyId: string): readonly Product[] {
    return this.products().filter((one) => one.companyId === companyId);
  }

  categoriesOf(companyId: string): readonly string[] {
    return [...new Set(this.ofCompany(companyId).map((one) => one.category))];
  }

  priceOf(productId: string, branchId?: string): number {
    const product = this.byId(productId);

    if (!product) {
      return 0;
    }

    if (product.priceScope !== 'sucursal' || branchId === undefined) {
      return product.priceBob;
    }

    const override = this.branchPrices().find(
      (one) => one.branchId === branchId && one.productId === productId,
    );

    return override?.priceBob ?? product.priceBob;
  }

  pricesOf(productId: string): readonly BranchPrice[] {
    return this.branchPrices().filter((one) => one.productId === productId);
  }

  isAvailable(branchId: string, productId: string): boolean {
    const override = this.stock().find(
      (one) => one.branchId === branchId && one.productId === productId,
    );

    return override?.available ?? true;
  }

  ofBranch(branchId: string): readonly Product[] {
    const branch = this.businesses.branchById(branchId);

    if (!branch) {
      return [];
    }

    return this.ofCompany(branch.companyId).filter((one) => this.isAvailable(branchId, one.id));
  }

  topSellers(companyId: string, limit = 5): readonly Product[] {
    return [...this.ofCompany(companyId)]
      .sort((left, right) => right.soldThisMonth - left.soldThisMonth)
      .slice(0, limit);
  }

  feedOf(type: BusinessType, cityId?: string): readonly FeedItem[] {
    const queues = this.sellingBranches(type, cityId).flatMap((branch) => {
      const company = this.businesses.companyById(branch.companyId);

      if (!company) {
        return [];
      }

      const items = this.ofBranch(branch.id)
        .slice()
        .sort(
          (left, right) =>
            Number(right.featured) - Number(left.featured) ||
            right.soldThisMonth - left.soldThisMonth,
        )
        .map((product) => ({
          product,
          branch,
          company,
          priceBob: this.priceOf(product.id, branch.id),
        }));

      return [items];
    });

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

  sellingBranches(type: BusinessType, cityId?: string): readonly Branch[] {
    return this.businesses
      .openBranches()
      .filter((one) => this.businesses.typeOfBranch(one.id) === type)
      .filter((one) => cityId === undefined || one.cityId === cityId)
      .slice()
      .sort((left, right) => left.name.localeCompare(right.name));
  }

  setPrice(productId: string, priceBob: number): void {
    this.productList.update((list) =>
      list.map((one) => (one.id === productId ? { ...one, priceBob } : one)),
    );
  }

  setPriceScope(productId: string, priceScope: PriceScope): void {
    this.productList.update((list) =>
      list.map((one) => (one.id === productId ? { ...one, priceScope } : one)),
    );

    if (priceScope === 'marca') {
      this.priceList.update((list) => list.filter((one) => one.productId !== productId));
    }
  }

  setBranchPrice(branchId: string, productId: string, priceBob: number): void {
    this.priceList.update((list) => {
      const rest = list.filter(
        (one) => !(one.branchId === branchId && one.productId === productId),
      );

      return [...rest, { branchId, productId, priceBob }];
    });
  }

  setAvailability(branchId: string, productId: string, available: boolean): void {
    this.stockList.update((list) => {
      const rest = list.filter(
        (one) => !(one.branchId === branchId && one.productId === productId),
      );

      return available ? rest : [...rest, { branchId, productId, available }];
    });
  }
}
