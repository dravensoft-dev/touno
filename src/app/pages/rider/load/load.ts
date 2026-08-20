import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import {
  ArenaActions,
  ArenaAlert,
  ArenaButton,
  ArenaEmptyState,
  ArenaKeyValue,
  ArenaKeyValueRow,
  ArenaPageHead,
  ArenaProgressBar,
  ArenaTable,
  ArenaTableCell,
  ArenaTableColumn,
  ArenaTableRow,
} from '@dravensoft/arena-angular';
import { Businesses } from '../../../domain/businesses';
import { Chat } from '../../../domain/chat';
import { Geography } from '../../../domain/geography';
import { Loads } from '../../../domain/loads';
import { Orders } from '../../../domain/orders';
import { Riders } from '../../../domain/riders';
import { Session } from '../../../domain/session';
import { bs, hhmm } from '../../../domain/format';
import { Notices } from '../../../layout/notices';
import { StateTag } from '../../../shared/state-tag/state-tag';

const COLUMNS: readonly ArenaTableColumn[] = [
  { header: 'Pedido', mono: true },
  { header: 'Comprador' },
  { header: 'Al llegar' },
  { header: 'Total', align: 'right' },
];

@Component({
  selector: 'app-rider-load',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [
    ArenaPageHead,
    ArenaActions,
    ArenaAlert,
    ArenaProgressBar,
    ArenaKeyValue,
    ArenaTable,
    ArenaTableRow,
    ArenaTableCell,
    ArenaButton,
    ArenaEmptyState,
    StateTag,
  ],
  templateUrl: './load.html',
})
export class RiderLoad {
  private readonly router = inject(Router);
  private readonly businesses = inject(Businesses);
  private readonly geography = inject(Geography);
  private readonly orders = inject(Orders);
  private readonly riders = inject(Riders);
  private readonly chat = inject(Chat);
  private readonly notices = inject(Notices);
  private readonly session = inject(Session);

  protected readonly loads = inject(Loads);

  readonly id = input('');

  protected readonly columns = COLUMNS;

  protected readonly riderId = computed(() => this.session.riderId() ?? '');

  private readonly found = computed(() => this.loads.byId(this.id()));

  protected readonly load = computed(() => {
    const load = this.found();

    return load && load.riderId === this.riderId() ? load : undefined;
  });

  protected readonly notMine = computed(() => this.found() !== undefined && !this.load());

  protected readonly missing = computed(() => this.loads.missing(this.id()));

  protected readonly full = computed(() => this.load() !== undefined && this.missing() === 0);

  protected readonly filling = computed(() => this.load()?.state === 'acumulando');

  protected readonly filledPct = computed(() => {
    const load = this.load();

    return load ? Math.round((load.orderCodes.length / load.capacity) * 100) : 0;
  });

  protected readonly carried = computed(() =>
    (this.load()?.orderCodes ?? []).flatMap((code) => {
      const order = this.orders.byCode(code);

      return order ? [order] : [];
    }),
  );

  protected readonly ghosts = computed(
    () => (this.load()?.orderCodes.length ?? 0) - this.carried().length,
  );

  protected readonly facts = computed<readonly ArenaKeyValueRow[]>(() => {
    const load = this.load();

    if (!load) {
      return [];
    }

    const from = this.businesses.branchById(load.fromBranchId);
    const to = this.businesses.branchById(load.toBranchId);

    return [
      {
        term: 'Sale de',
        value: `${from?.name ?? ''} · ${this.geography.nameOf(from?.cityId ?? '')}`,
      },
      { term: 'Llega a', value: `${to?.name ?? ''} · ${this.geography.nameOf(to?.cityId ?? '')}` },
      { term: 'Salida prevista', value: hhmm(load.departsAt), numeric: true },
      { term: 'Llegada prevista', value: hhmm(load.arrivesAt), numeric: true },
      {
        term: 'Ganas',
        value: bs(this.riders.byId(this.riderId())?.ratePerTripBob ?? 0),
        numeric: true,
      },
    ];
  });

  protected endingOf(code: string): string {
    return this.orders.byCode(code)?.delivery === 'sucursal'
      ? 'Lo recogen en mostrador'
      : 'Un rider local lo lleva';
  }

  protected depart(): void {
    const load = this.load();

    if (!load) {
      return;
    }

    this.loads.depart(load.id);

    for (const order of this.carried()) {
      this.orders.advance(order.slug, 'en-ruta-interurbana');
      this.chat.handOver(
        order.threadId,
        { kind: 'rider', riderId: this.riderId(), since: order.placedAt },
        this.riders.nameOf(this.riderId()),
        `La carga salió de ${this.businesses.branchById(load.fromBranchId)?.name ?? ''} hacia ${this.geography.nameOf(this.businesses.cityOf(load.toBranchId))} con ${this.riders.nameOf(this.riderId())}. Ahora hablas con él.`,
      );
    }

    this.notices.loadDeparted();
  }

  protected back(): void {
    void this.router.navigateByUrl('/rider/encargos');
  }
}
