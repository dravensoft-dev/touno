import { Injectable, computed, inject, signal } from '@angular/core';
import { Businesses } from './businesses';
import { Branch, BusinessType } from './businesses.model';
import { BranchStock, FeedItem, Product } from './catalog.model';
import { BRANCH_STOCK, PRODUCTS } from './catalog.data';

@Injectable({ providedIn: 'root' })
export class Catalog {
  private readonly businesses = inject(Businesses);

  private readonly productList = signal<readonly Product[]>(PRODUCTS);
  private readonly stockList = signal<readonly BranchStock[]>(BRANCH_STOCK);

  readonly products = this.productList.asReadonly();

  readonly stock = this.stockList.asReadonly();

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
        .map((product) => ({ product, branch, company }));

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

  setAvailability(branchId: string, productId: string, available: boolean): void {
    this.stockList.update((list) => {
      const rest = list.filter(
        (one) => !(one.branchId === branchId && one.productId === productId),
      );

      return available ? rest : [...rest, { branchId, productId, available }];
    });
  }
}
