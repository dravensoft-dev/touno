import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  ArenaAlert,
  ArenaButton,
  ArenaEmptyState,
  ArenaPageHead,
  ArenaSection,
  ArenaTable,
  ArenaTableCell,
  ArenaTableColumn,
  ArenaTableRow,
} from '@dravensoft/arena-angular';
import { Businesses } from '../../../domain/businesses';
import { Chat } from '../../../domain/chat';
import { Loads } from '../../../domain/loads';
import { Orders } from '../../../domain/orders';
import { Riders } from '../../../domain/riders';
import { Session } from '../../../domain/session';
import { Order } from '../../../domain/orders.model';
import { fechaHora } from '../../../domain/format';
import { Notices } from '../../../layout/notices';
import { ScanPanel } from '../../../shared/scan-panel/scan-panel';

const COLUMNS: readonly ArenaTableColumn[] = [
  { header: 'Pedido', mono: true },
  { header: 'Comprador' },
  { header: 'Llegó', align: 'right' },
  { header: 'Estado' },
];

const LOAD_COLUMNS: readonly ArenaTableColumn[] = [
  { header: 'Carga', mono: true },
  { header: 'Sale de' },
  { header: 'Rider' },
  { header: 'Pedidos', align: 'right' },
  { header: 'Llega', align: 'right' },
];

@Component({
  selector: 'app-branch-pickups',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [
    ArenaPageHead,
    ArenaSection,
    ArenaAlert,
    ArenaTable,
    ArenaTableRow,
    ArenaTableCell,
    ArenaButton,
    ArenaEmptyState,
    ScanPanel,
  ],
  templateUrl: './pickups.html',
})
export class BranchPickups {
  private readonly router = inject(Router);
  private readonly businesses = inject(Businesses);
  private readonly riders = inject(Riders);
  private readonly chat = inject(Chat);
  private readonly notices = inject(Notices);
  private readonly session = inject(Session);

  protected readonly orders = inject(Orders);
  protected readonly loads = inject(Loads);

  protected readonly columns = COLUMNS;
  protected readonly loadColumns = LOAD_COLUMNS;

  protected readonly branchId = computed(() => this.session.branchId() ?? '');

  protected readonly branch = computed(() => this.businesses.branchById(this.branchId()));

  protected readonly waiting = computed(() => this.orders.toCollect(this.branchId()));

  protected readonly arriving = computed(() => this.loads.arriving(this.branchId()));

  protected readonly toDeliver = computed(() =>
    this.orders.ofBranch(this.branchId()).filter((one) => one.state === 'en-sucursal-destino'),
  );

  protected readonly scanning = signal<Order | null>(null);

  protected readonly expected = computed(() => this.scanning()?.code ?? '');

  protected rowsOf(orders: readonly Order[]) {
    return orders.map((order) => ({
      order,
      arrived: fechaHora(order.custody.since),
    }));
  }

  protected riderName(id: string): string {
    return this.riders.nameOf(id);
  }

  protected branchName(id: string): string {
    return this.businesses.branchById(id)?.name ?? '';
  }

  protected startScan(order: Order): void {
    this.scanning.set(order);
  }

  protected cancelScan(): void {
    this.scanning.set(null);
  }

  protected onScanned(code: string): void {
    const order = this.scanning();

    if (!order) {
      return;
    }

    if (code.toUpperCase() !== order.code) {
      this.notices.codeMismatch();

      return;
    }

    this.orders.scan(order.slug, this.branchId());
    this.chat.note(
      order.threadId,
      `${this.branch()?.managerName ?? 'La sucursal'} escaneó tu código en mostrador. Pedido entregado.`,
    );
    this.notices.orderScanned(order.code);
    this.scanning.set(null);
  }

  protected open(order: Order): void {
    void this.router.navigateByUrl(`/sucursal/pedidos/${order.slug}`);
  }
}
