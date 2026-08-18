import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  ArenaButton,
  ArenaCheckbox,
  ArenaConfirmDialog,
  ArenaFallback,
  ArenaFigure,
  ArenaInput,
  ArenaKeyValue,
  ArenaKeyValueRow,
  ArenaPageHead,
  ArenaRadio,
  ArenaRadioGroup,
  ArenaTextarea,
} from '@dravensoft/arena-angular';
import { Marketplace } from '../../../domain/marketplace';
import { bs } from '../../../domain/format';

@Component({
  selector: 'app-restaurant-menu-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [
    ArenaPageHead,
    ArenaInput,
    ArenaTextarea,
    ArenaRadioGroup,
    ArenaRadio,
    ArenaCheckbox,
    ArenaFigure,
    ArenaFallback,
    ArenaKeyValue,
    ArenaButton,
    ArenaConfirmDialog,
  ],
  templateUrl: './menu-item.html',
})
export class RestaurantMenuItem {
  private readonly router = inject(Router);
  private readonly marketplace = inject(Marketplace);

  readonly id = input.required<string>();

  protected readonly variant = signal('');
  protected readonly addons = signal<readonly string[]>([]);
  protected readonly removing = signal(false);

  protected readonly product = computed(() => {
    const product = this.marketplace.productById(this.id());

    if (!product) {
      throw new Error(`Unknown product: ${this.id()}`);
    }

    return product;
  });

  protected readonly resulting = computed<readonly ArenaKeyValueRow[]>(() => {
    const product = this.product();
    const variant = product.variants.find((one) => one.id === this.variant());
    const chosen = product.addons.filter((one) => this.addons().includes(one.id));

    return [
      { term: 'Precio base', value: bs(product.priceBob), numeric: true },
      ...(variant ? [{ term: variant.label, value: bs(variant.deltaBob), numeric: true }] : []),
      ...chosen.map((one) => ({ term: one.label, value: bs(one.priceBob), numeric: true })),
    ];
  });

  protected readonly total = computed<ArenaKeyValueRow>(() => {
    const product = this.product();
    const variant = product.variants.find((one) => one.id === this.variant());
    const chosen = product.addons.filter((one) => this.addons().includes(one.id));

    return {
      term: 'Precio resultante',
      value: bs(
        product.priceBob +
          (variant?.deltaBob ?? 0) +
          chosen.reduce((sum, one) => sum + one.priceBob, 0),
      ),
      numeric: true,
    };
  });

  protected toggleAddon(id: string): void {
    this.addons.update((current) =>
      current.includes(id) ? current.filter((one) => one !== id) : [...current, id],
    );
  }

  protected askRemove(): void {
    this.removing.set(true);
  }

  protected cancelRemove(): void {
    this.removing.set(false);
  }

  protected confirmRemove(): void {
    this.removing.set(false);
    void this.router.navigateByUrl('/restaurante/carta');
  }

  protected back(): void {
    void this.router.navigateByUrl('/restaurante/carta');
  }
}
