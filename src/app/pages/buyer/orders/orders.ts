import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  ArenaEmptyState,
  ArenaIconButton,
  ArenaMenu,
  ArenaMenuItem,
  ArenaPageHead,
  ArenaSegmentOption,
  ArenaSegmentedControl,
  ArenaTable,
  ArenaTableCell,
  ArenaTableColumn,
  ArenaTableRow,
} from '@dravensoft/arena-angular';
import { Marketplace } from '../../../domain/marketplace';
import { Orders } from '../../../domain/orders';
import { bs, fechaHora } from '../../../domain/format';
import { copyText } from '../../../domain/clipboard';
import { Notices } from '../../../layout/notices';
import { StatusTag } from '../../../shared/status-tag/status-tag';

const COLUMNS: readonly ArenaTableColumn[] = [
  { header: 'Pedido', mono: true },
  { header: 'Comercio' },
  { header: 'Estado' },
  { header: 'Hecho', align: 'right' },
  { header: 'Total', align: 'right' },
  { header: 'Acciones', align: 'right', mobileLayout: 'block' },
];

const OPEN_ROW = 'Ver el pedido';
const TRACK_ROW = 'Seguir el envío';
const COPY_ROW = 'Copiar el código';

const FILTERS: readonly ArenaSegmentOption[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'comida', label: 'Comida' },
  { value: 'encomienda', label: 'Encomiendas' },
];

const BUYER_PHONE = '7712 4408';

@Component({
  selector: 'app-buyer-orders',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [
    ArenaPageHead,
    ArenaSegmentedControl,
    ArenaTable,
    ArenaTableRow,
    ArenaTableCell,
    ArenaMenu,
    ArenaIconButton,
    ArenaEmptyState,
    StatusTag,
  ],
  templateUrl: './orders.html',
})
export class BuyerOrders {
  private readonly router = inject(Router);
  private readonly orders = inject(Orders);
  private readonly marketplace = inject(Marketplace);
  private readonly notices = inject(Notices);

  protected readonly columns = COLUMNS;
  protected readonly filters = FILTERS;
  protected readonly filter = signal('todos');

  protected readonly rows = computed(() =>
    this.orders
      .ofBuyer(BUYER_PHONE)
      .filter((one) => this.filter() === 'todos' || one.vertical === this.filter())
      .map((one) => ({
        ...one,
        merchant: this.marketplace.bySlug(one.merchantSlug)?.name ?? one.merchantSlug,
        placed: fechaHora(one.placedAt),
        total: bs(one.totalBob),
        actions: [
          { label: OPEN_ROW, icon: 'ph-bold ph-arrow-right' },
          {
            label: TRACK_ROW,
            icon: 'ph-bold ph-map-pin-simple-area',
            disabled: one.shipmentGuia === undefined,
          },
          { label: COPY_ROW, icon: 'ph-bold ph-copy' },
        ] as readonly ArenaMenuItem[],
      })),
  );

  protected open(slug: string): void {
    void this.router.navigateByUrl(`/mis-pedidos/${slug}`);
  }

  protected runOn(
    row: { readonly slug: string; readonly code: string; readonly shipmentGuia?: string },
    item: ArenaMenuItem,
  ): void {
    if (item.label === OPEN_ROW) {
      this.open(row.slug);

      return;
    }

    if (item.label === TRACK_ROW) {
      const guia = row.shipmentGuia;

      if (guia) {
        void this.router.navigateByUrl(`/seguimiento/${guia.toLowerCase()}`);
      }

      return;
    }

    void copyText(row.code).then((done) =>
      done ? this.notices.codeCopied(row.code) : this.notices.codeNotCopied(row.code),
    );
  }
}
