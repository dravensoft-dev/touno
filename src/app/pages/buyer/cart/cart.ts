import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  ArenaAlert,
  ArenaButton,
  ArenaEmptyState,
  ArenaIconButton,
  ArenaKeyValue,
  ArenaKeyValueRow,
  ArenaPageHead,
  ArenaTable,
  ArenaTableCell,
  ArenaTableColumn,
  ArenaTableRow,
} from '@dravensoft/arena-angular';
import { Cart } from '../../../domain/cart';
import { Marketplace } from '../../../domain/marketplace';
import { bs } from '../../../domain/format';

const COLUMNS: readonly ArenaTableColumn[] = [
  { header: 'Producto' },
  { header: 'Comercio' },
  { header: 'Cantidad', align: 'right' },
  { header: 'Subtotal', align: 'right' },
  { header: 'Quitar', mobileLayout: 'block' },
];

@Component({
  selector: 'app-buyer-cart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [
    ArenaPageHead,
    ArenaTable,
    ArenaTableRow,
    ArenaTableCell,
    ArenaIconButton,
    ArenaKeyValue,
    ArenaAlert,
    ArenaButton,
    ArenaEmptyState,
  ],
  templateUrl: './cart.html',
})
export class BuyerCart {
  private readonly router = inject(Router);
  private readonly marketplace = inject(Marketplace);

  protected readonly cart = inject(Cart);

  protected readonly columns = COLUMNS;

  protected readonly rows = computed(() =>
    this.cart.all().map((line) => ({
      ...line,
      merchant: this.marketplace.bySlug(line.merchantSlug)?.name ?? line.merchantSlug,
      subtotal: bs(line.unitBob * line.qty),
    })),
  );

  protected readonly mixed = computed(
    () =>
      this.cart
        .merchants()
        .map((slug) => this.marketplace.bySlug(slug)?.kind)
        .filter((kind, index, all) => all.indexOf(kind) === index).length > 1,
  );

  protected readonly summary = computed<readonly ArenaKeyValueRow[]>(() => [
    { term: 'Productos', value: bs(this.cart.subtotalBob()), numeric: true },
    { term: 'Envíos', value: bs(this.cart.deliveryBob()), numeric: true },
  ]);

  protected readonly total = computed<ArenaKeyValueRow>(() => ({
    term: 'Total',
    value: bs(this.cart.totalBob()),
    numeric: true,
  }));

  protected checkout(): void {
    this.cart.clear();
    void this.router.navigateByUrl('/mis-pedidos');
  }

  protected browse(): void {
    void this.router.navigateByUrl('/');
  }
}
