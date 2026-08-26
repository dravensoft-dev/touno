import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  ArenaAlert,
  ArenaBoard,
  ArenaBoardColumn,
  ArenaButton,
  ArenaCard,
  ArenaConfirmDialog,
  ArenaEmptyState,
  ArenaPageHead,
} from '@dravensoft/arena-angular';
import { Businesses } from '../../../domain/businesses';
import { Chat } from '../../../domain/chat';
import { Geography } from '../../../domain/geography';
import { Orders } from '../../../domain/orders';
import { Session } from '../../../domain/session';
import { Order, OrderState, isInterurban } from '../../../domain/orders.model';
import { bs, hhmm } from '../../../domain/format';
import { Notices } from '../../../layout/notices';
import { StateTag } from '../../../shared/state-tag/state-tag';

interface Column {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly states: readonly OrderState[];
}

const COLUMNS: readonly Column[] = [
  { id: 'nuevos', title: 'Nuevos', summary: 'Aceptar o rechazar', states: ['nuevo'] },
  {
    id: 'preparando',
    title: 'Preparando',
    summary: 'En cocina o en depósito',
    states: ['aceptado', 'preparando'],
  },
  {
    id: 'sin-rider',
    title: 'Esperando rider',
    summary: 'Listos, sin quién los lleve',
    states: ['esperando-rider', 'esperando-carga'],
  },
  {
    id: 'en-camino',
    title: 'En camino',
    summary: 'Ya salieron',
    states: ['en-camino', 'en-ruta-interurbana', 'reparto-local'],
  },
];

@Component({
  selector: 'app-branch-orders',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [
    ArenaPageHead,
    ArenaBoard,
    ArenaBoardColumn,
    ArenaCard,
    ArenaButton,
    ArenaAlert,
    ArenaConfirmDialog,
    ArenaEmptyState,
    StateTag,
  ],
  templateUrl: './orders.html',
  styleUrl: './orders.css',
})
export class BranchOrders {
  private readonly router = inject(Router);
  private readonly businesses = inject(Businesses);
  private readonly geography = inject(Geography);
  private readonly chat = inject(Chat);
  private readonly notices = inject(Notices);
  private readonly session = inject(Session);

  protected readonly orders = inject(Orders);

  protected readonly columns = COLUMNS;

  protected readonly rejecting = signal<Order | null>(null);

  protected readonly branchId = computed(() => this.session.branchId() ?? '');

  protected readonly branch = computed(() => this.businesses.branchById(this.branchId()));

  protected readonly cityName = computed(() => this.geography.nameOf(this.branch()?.cityId ?? ''));

  protected readonly board = computed(() => this.orders.liveOfBranch(this.branchId()));

  protected readonly waiting = computed(() =>
    this.board().filter((one) => one.state === 'esperando-rider'),
  );

  protected inColumn(column: Column): readonly Order[] {
    return this.board().filter((one) => column.states.includes(one.state));
  }

  protected card(order: Order): { lines: string; when: string; total: string; away: boolean } {
    return {
      lines: order.lines.map((one) => `${one.qty} × ${one.name}`).join(', '),
      when: hhmm(order.placedAt),
      total: bs(order.totalBob),
      away: isInterurban(order.scenario),
    };
  }

  protected accept(order: Order): void {
    this.orders.advance(order.slug, 'preparando');
  }

  protected ready(order: Order): void {
    this.orders.advance(
      order.slug,
      isInterurban(order.scenario) ? 'esperando-carga' : 'esperando-rider',
    );
  }

  protected askReject(order: Order): void {
    this.rejecting.set(order);
  }

  protected cancelReject(): void {
    this.rejecting.set(null);
  }

  protected confirmReject(): void {
    const order = this.rejecting();

    if (order) {
      this.orders.advance(order.slug, 'rechazado');
      this.chat.note(order.threadId, 'La sucursal rechazó tu pedido. No se te cobró nada.');
      this.rejecting.set(null);
    }
  }

  protected open(order: Order): void {
    void this.router.navigateByUrl(`/sucursal/pedidos/${order.slug}`);
  }

  protected openFirstWaiting(): void {
    const first = this.waiting()[0];

    if (first) {
      this.open(first);
    }
  }
}
