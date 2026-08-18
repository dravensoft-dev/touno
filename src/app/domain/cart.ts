import { Injectable, computed, signal } from '@angular/core';
import { Product } from './marketplace.model';

export interface CartLine {
  readonly productId: string;
  readonly merchantSlug: string;
  readonly name: string;
  readonly unitBob: number;
  readonly qty: number;
}

@Injectable({ providedIn: 'root' })
export class Cart {
  private readonly lines = signal<readonly CartLine[]>([]);

  readonly all = this.lines.asReadonly();

  readonly count = computed(() => this.all().reduce((sum, line) => sum + line.qty, 0));

  readonly subtotalBob = computed(() =>
    this.all().reduce((sum, line) => sum + line.unitBob * line.qty, 0),
  );

  readonly merchants = computed(() => [...new Set(this.all().map((line) => line.merchantSlug))]);

  readonly deliveryBob = computed(() => this.merchants().length * 8);

  readonly totalBob = computed(() => this.subtotalBob() + this.deliveryBob());

  add(product: Product): void {
    this.lines.update((current) => {
      const existing = current.find((line) => line.productId === product.id);

      if (existing) {
        return current.map((line) =>
          line.productId === product.id ? { ...line, qty: line.qty + 1 } : line,
        );
      }

      return [
        ...current,
        {
          productId: product.id,
          merchantSlug: product.merchantSlug,
          name: product.name,
          unitBob: product.priceBob,
          qty: 1,
        },
      ];
    });
  }

  remove(productId: string): void {
    this.lines.update((current) => current.filter((line) => line.productId !== productId));
  }

  clear(): void {
    this.lines.set([]);
  }
}
