import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  ArenaAlert,
  ArenaBarChart,
  ArenaButton,
  ArenaChartCard,
  ArenaSeries,
  ArenaEmptyState,
  ArenaGrid,
  ArenaKeyValue,
  ArenaKeyValueRow,
  ArenaInput,
  ArenaPageHead,
  ArenaRadio,
  ArenaRadioGroup,
  ArenaSection,
  ArenaStatCard,
  ArenaTable,
  ArenaTableCell,
  ArenaTableColumn,
  ArenaTableRow,
} from '@dravensoft/arena-angular';
import { Agreements } from '../../../domain/agreements';
import { Businesses } from '../../../domain/businesses';
import { Orders } from '../../../domain/orders';
import { Riders } from '../../../domain/riders';
import { Session } from '../../../domain/session';
import { bs, fecha } from '../../../domain/format';
import {
  CardDraft,
  PayoutMethod,
  cardLabel,
  completeCard,
  payoutRouteOf,
} from '../../../domain/payments.model';
import { Notices } from '../../../layout/notices';

const COLUMNS: readonly ArenaTableColumn[] = [
  { header: 'Día' },
  { header: 'Viajes', align: 'right' },
  { header: 'Ganancia', align: 'right' },
];

@Component({
  selector: 'app-rider-earnings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [
    ArenaPageHead,
    ArenaGrid,
    ArenaStatCard,
    ArenaChartCard,
    ArenaBarChart,
    ArenaKeyValue,
    ArenaSection,
    ArenaAlert,
    ArenaInput,
    ArenaRadioGroup,
    ArenaRadio,
    ArenaButton,
    ArenaTable,
    ArenaTableRow,
    ArenaTableCell,
    ArenaEmptyState,
  ],
  templateUrl: './earnings.html',
})
export class RiderEarnings {
  private readonly agreements = inject(Agreements);
  private readonly businesses = inject(Businesses);
  private readonly orders = inject(Orders);
  private readonly notices = inject(Notices);
  private readonly session = inject(Session);

  protected readonly riders = inject(Riders);

  protected readonly columns = COLUMNS;

  protected readonly riderId = computed(() => this.session.riderId() ?? '');

  protected readonly rider = computed(() => this.riders.byId(this.riderId()));

  protected readonly payouts = computed(() => this.riders.payouts);

  protected readonly total = computed(() => bs(this.riders.weekEarnings()));

  protected readonly trips = computed(() => this.riders.weekTrips());

  protected readonly average = computed(() =>
    bs(this.trips() === 0 ? 0 : Math.round(this.riders.weekEarnings() / this.trips())),
  );

  protected readonly labels = computed(() => this.payouts().map((one) => one.label));

  protected readonly series = computed<readonly ArenaSeries[]>(() => [
    { label: 'Ganancia', values: this.payouts().map((one) => one.earnBob) },
  ]);

  protected readonly byCompany = computed<readonly ArenaKeyValueRow[]>(() =>
    this.agreements.activeFor(this.riderId()).map((one) => ({
      term: this.businesses.companyById(one.companyId)?.name ?? '',
      value: `${bs(one.perTripBob)} por viaje`,
      numeric: true,
    })),
  );

  protected readonly card = computed(() => this.rider()?.card);

  protected readonly cardName = computed(() => {
    const card = this.card();

    return card ? cardLabel(card) : 'Ninguna registrada';
  });

  protected readonly method = computed<PayoutMethod>(
    () => this.rider()?.payoutMethod ?? 'automatico',
  );

  protected readonly account = computed(() => this.rider()?.account ?? '');

  protected readonly payers = computed<readonly ArenaKeyValueRow[]>(() =>
    this.agreements.activeFor(this.riderId()).map((one) => {
      const company = this.businesses.companyById(one.companyId);
      const route = payoutRouteOf(this.method(), this.card(), company?.card);

      return {
        term: company?.name ?? '',
        value:
          route === 'tarjeta'
            ? `A tu tarjeta ${this.cardName()}`
            : company?.card === undefined
              ? `A tu cuenta ${this.account()}, porque esta empresa no registró tarjeta`
              : `A tu cuenta ${this.account()}`,
      };
    }),
  );

  protected readonly draft = signal<CardDraft>({
    brand: '',
    last4: '',
    holder: '',
    expires: '',
  });

  protected readonly readyCard = computed(() => completeCard(this.draft()));

  protected onBrand(brand: string): void {
    this.draft.update((one) => ({ ...one, brand }));
  }

  protected onLast4(last4: string): void {
    this.draft.update((one) => ({ ...one, last4 }));
  }

  protected onHolder(holder: string): void {
    this.draft.update((one) => ({ ...one, holder }));
  }

  protected onExpires(expires: string): void {
    this.draft.update((one) => ({ ...one, expires }));
  }

  protected pickMethod(value: string): void {
    this.riders.setPayoutMethod(this.riderId(), value as PayoutMethod);
    this.notices.payoutMethodChanged(value as PayoutMethod);
  }

  protected saveCard(): void {
    if (!this.readyCard()) {
      return;
    }

    const draft = this.draft();

    this.riders.setCard(this.riderId(), {
      brand: draft.brand.trim(),
      last4: draft.last4.trim(),
      holder: draft.holder.trim(),
      expires: draft.expires.trim(),
    });

    this.draft.set({ brand: '', last4: '', holder: '', expires: '' });
    this.notices.cardSaved();
  }

  protected removeCard(): void {
    this.riders.setCard(this.riderId(), undefined);
    this.riders.setPayoutMethod(this.riderId(), 'automatico');
    this.notices.cardRemoved();
  }

  protected readonly delivered = computed(
    () => this.orders.all().filter((one) => one.scannedBy === this.riderId()).length,
  );

  protected dayOf(day: string): string {
    return fecha(`${day}T00:00:00`);
  }

  protected money(value: number): string {
    return bs(value);
  }
}
