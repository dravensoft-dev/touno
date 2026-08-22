import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import {
  ArenaAlert,
  ArenaButton,
  ArenaEmptyState,
  ArenaKeyValue,
  ArenaKeyValueRow,
  ArenaPageHead,
} from '@dravensoft/arena-angular';
import { Chat } from '../../../domain/chat';
import { Orders } from '../../../domain/orders';
import { Riders } from '../../../domain/riders';
import { Session } from '../../../domain/session';
import { movingLeg } from '../../../domain/orders.model';
import { bs } from '../../../domain/format';
import { Notices } from '../../../layout/notices';
import { ScanPanel } from '../../../shared/scan-panel/scan-panel';

@Component({
  selector: 'app-rider-scan',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [ArenaPageHead, ArenaAlert, ArenaKeyValue, ArenaButton, ArenaEmptyState, ScanPanel],
  templateUrl: './scan.html',
})
export class RiderScan {
  private readonly router = inject(Router);
  private readonly chat = inject(Chat);
  private readonly riders = inject(Riders);
  private readonly notices = inject(Notices);
  private readonly session = inject(Session);

  protected readonly orders = inject(Orders);

  readonly codigo = input('');

  protected readonly riderId = computed(() => this.session.riderId() ?? '');

  protected readonly order = computed(() => {
    const order = this.orders.bySlug(this.codigo());
    const leg = order ? movingLeg(order.state) : undefined;

    return order && leg !== undefined && this.orders.legOf(order, leg)?.riderId === this.riderId()
      ? order
      : undefined;
  });

  protected readonly delivered = computed(() => {
    const order = this.orders.bySlug(this.codigo());

    return order?.state === 'entregado' && order.scannedBy === this.riderId();
  });

  protected readonly facts = computed<readonly ArenaKeyValueRow[]>(() => {
    const order = this.order();

    if (!order) {
      return [];
    }

    return [
      { term: 'Comprador', value: order.buyer.name },
      { term: 'Entregas en', value: order.address ?? '' },
      { term: 'Total del pedido', value: bs(order.totalBob), numeric: true },
    ];
  });

  protected onScanned(code: string): void {
    const order = this.order();

    if (!order) {
      return;
    }

    if (code.toUpperCase() !== order.code) {
      this.notices.codeMismatch();

      return;
    }

    const spent = this.orders.scan(order.slug, this.riderId());
    this.chat.note(
      order.threadId,
      `${this.riders.nameOf(this.riderId())} escaneó tu código. Pedido entregado.`,
    );
    this.notices.orderScanned(order.code);

    if (spent?.state === 'cumplido') {
      this.notices.recruitmentFulfilled();
    } else if (spent) {
      this.notices.pointSpent(spent.pointsLeft);
    }
  }

  protected back(): void {
    void this.router.navigateByUrl('/rider/encargos');
  }
}
