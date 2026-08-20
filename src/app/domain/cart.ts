import { Injectable, computed, inject, signal } from '@angular/core';
import { Businesses } from './businesses';
import { Product } from './catalog.model';

export interface CartLine {
  readonly productId: string;
  readonly branchId: string;
  readonly companyId: string;
  readonly name: string;
  readonly unitBob: number;
  readonly qty: number;
}

@Injectable({ providedIn: 'root' })
export class Cart {
  private readonly businesses = inject(Businesses);

  private readonly lines = signal<readonly CartLine[]>([]);

  readonly all = this.lines.asReadonly();

  readonly count = computed(() => this.all().reduce((sum, one) => sum + one.qty, 0));

  readonly subtotalBob = computed(() =>
    this.all().reduce((sum, one) => sum + one.qty * one.unitBob, 0),
  );

  readonly branches = computed(() => [...new Set(this.all().map((one) => one.branchId))]);

  readonly deliveryBob = computed(() =>
    this.branches().reduce(
      (sum, one) => sum + (this.businesses.branchById(one)?.deliveryBob ?? 0),
      0,
    ),
  );

  readonly totalBob = computed(() => this.subtotalBob() + this.deliveryBob());

  readonly companies = computed(() => [...new Set(this.all().map((one) => one.companyId))]);

  linesOf(branchId: string): readonly CartLine[] {
    return this.all().filter((one) => one.branchId === branchId);
  }

  add(product: Product, branchId: string): void {
    this.lines.update((list) => {
      const held = list.find((one) => one.productId === product.id && one.branchId === branchId);

      if (held) {
        return list.map((one) => (one === held ? { ...one, qty: one.qty + 1 } : one));
      }

      return [
        ...list,
        {
          productId: product.id,
          branchId,
          companyId: product.companyId,
          name: product.name,
          unitBob: product.priceBob,
          qty: 1,
        },
      ];
    });
  }

  remove(productId: string, branchId: string): void {
    this.lines.update((list) =>
      list.filter((one) => !(one.productId === productId && one.branchId === branchId)),
    );
  }

  clear(): void {
    this.lines.set([]);
  }
}
