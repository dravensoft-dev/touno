import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  ArenaAlert,
  ArenaButton,
  ArenaEmptyState,
  ArenaKeyValue,
  ArenaKeyValueRow,
  ArenaPageHead,
} from '@dravensoft/arena-angular';
import { Businesses } from '../../../domain/businesses';
import { Callouts } from '../../../domain/callouts';
import { Chat } from '../../../domain/chat';
import { Orders } from '../../../domain/orders';
import { Riders } from '../../../domain/riders';
import { Session } from '../../../domain/session';
import { movingLeg } from '../../../domain/orders.model';
import { bs } from '../../../domain/format';
import { Notices } from '../../../layout/notices';
import { FreeAgentPrompt } from '../../../shared/free-agent-prompt/free-agent-prompt';
import { ScanPanel } from '../../../shared/scan-panel/scan-panel';

@Component({
  selector: 'app-rider-scan',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [
    ArenaPageHead,
    ArenaAlert,
    ArenaKeyValue,
    ArenaButton,
    ArenaEmptyState,
    ScanPanel,
    FreeAgentPrompt,
  ],
  templateUrl: './scan.html',
})
export class RiderScan {
  private readonly router = inject(Router);
  private readonly businesses = inject(Businesses);
  private readonly callouts = inject(Callouts);
  private readonly chat = inject(Chat);
  private readonly riders = inject(Riders);
  private readonly notices = inject(Notices);
  private readonly session = inject(Session);

  protected readonly orders = inject(Orders);

  readonly codigo = input('');

  protected readonly asking = signal<string | undefined>(undefined);

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
      this.notices.runSpent(spent.runsLeft);
    }

    const claim = this.callouts.holdingOf(this.riderId());

    if (claim) {
      this.asking.set(claim.id);
    }
  }

  protected readonly askedAbout = computed(() => {
    const claim = this.callouts.claimById(this.asking() ?? '');
    const callout = claim && this.callouts.byId(claim.calloutId);

    if (!callout) {
      return undefined;
    }

    return {
      company: this.businesses.companyById(callout.companyId)?.name ?? '',
      branch: this.businesses.branchById(callout.branchId)?.name ?? '',
    };
  });

  protected onKeep(): void {
    this.asking.set(undefined);
  }

  protected onQuit(): void {
    const id = this.asking();

    if (id) {
      this.callouts.leave(id);
      this.notices.leftTheCallout(this.askedAbout()?.branch ?? '');
    }

    this.asking.set(undefined);
  }

  protected back(): void {
    void this.router.navigateByUrl('/rider/encargos');
  }
}
