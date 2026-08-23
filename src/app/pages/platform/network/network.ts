import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import {
  ArenaAlert,
  ArenaEmptyState,
  ArenaGrid,
  ArenaPageHead,
  ArenaSection,
  ArenaStatCard,
  ArenaTable,
  ArenaTableCell,
  ArenaTableColumn,
  ArenaTableRow,
} from '@dravensoft/arena-angular';
import { Agreements } from '../../../domain/agreements';
import { Businesses } from '../../../domain/businesses';
import { Platform } from '../../../domain/platform';
import { Riders } from '../../../domain/riders';
import { Company } from '../../../domain/businesses.model';
import { Rider } from '../../../domain/riders.model';
import { cardLabel, payoutRouteOf } from '../../../domain/payments.model';
import { bs, porcentaje } from '../../../domain/format';
import { Reputation } from '../../../domain/reputation';

const COMPANY_COLUMNS: readonly ArenaTableColumn[] = [
  { header: 'Empresa' },
  { header: 'Recargo por clima', align: 'right' },
  { header: 'Envío base más bajo', align: 'right' },
  { header: 'Tarjeta' },
];

const FLOOR_COLUMNS: readonly ArenaTableColumn[] = [
  { header: 'Quién' },
  { header: 'Qué es' },
  { header: 'Cumplimiento', align: 'right' },
];

const RIDER_COLUMNS: readonly ArenaTableColumn[] = [
  { header: 'Rider' },
  { header: 'Cómo quiere cobrar' },
  { header: 'Cómo cobra de verdad' },
];

@Component({
  selector: 'app-platform-network',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [
    ArenaPageHead,
    ArenaSection,
    ArenaGrid,
    ArenaStatCard,
    ArenaAlert,
    ArenaTable,
    ArenaTableRow,
    ArenaTableCell,
    ArenaEmptyState,
  ],
  templateUrl: './network.html',
})
export class PlatformNetwork {
  private readonly agreements = inject(Agreements);
  private readonly platform = inject(Platform);
  private readonly reputation = inject(Reputation);

  protected readonly businesses = inject(Businesses);
  protected readonly riders = inject(Riders);

  protected readonly companyColumns = COMPANY_COLUMNS;
  protected readonly riderColumns = RIDER_COLUMNS;
  protected readonly floorColumns = FLOOR_COLUMNS;

  protected readonly underFloor = computed(() => [
    ...this.businesses
      .branches()
      .filter((one) => !this.reputation.clears(one.id))
      .map((one) => ({
        name: one.name,
        kind: 'Sucursal',
        figure: porcentaje(this.reputation.of(one.id).pct),
      })),
    ...this.riders
      .all()
      .filter((one) => !this.reputation.clears(one.id))
      .map((one) => ({
        name: one.name,
        kind: 'Rider',
        figure: porcentaje(this.reputation.of(one.id).pct),
      })),
  ]);

  protected readonly peaks = computed(() =>
    this.agreements.all().filter((one) => one.kind === 'hora-pico'),
  );

  protected readonly livePeaks = computed(() =>
    this.peaks().filter((one) => one.state === 'activo'),
  );

  protected readonly withCard = computed(
    () => this.riders.all().filter((one) => one.card !== undefined).length,
  );

  protected weatherOf(company: Company): string {
    return bs(this.businesses.weatherFeeOf(company.id));
  }

  protected raisedWeather(company: Company): boolean {
    return this.businesses.weatherFeeOf(company.id) > this.platform.weatherFeeBob();
  }

  protected lowestFee(company: Company): string {
    const fees = this.businesses
      .branchesOf(company.id)
      .map((one) => this.businesses.deliveryFeeOf(one.id));

    return bs(fees.length > 0 ? Math.min(...fees) : this.platform.minDeliveryFeeBob());
  }

  protected cardOf(company: Company): string {
    const card = company.card;

    return card ? cardLabel(card) : 'Sin tarjeta';
  }

  protected wants(rider: Rider): string {
    return rider.payoutMethod === 'tarjeta' ? 'A su tarjeta' : 'Depósito automático';
  }

  protected getsPaid(rider: Rider): string {
    const routes = this.agreements.activeFor(rider.id).map((one) => {
      const company = this.businesses.companyById(one.companyId);

      return payoutRouteOf(rider.payoutMethod, rider.card, company?.card);
    });

    if (routes.length === 0) {
      return 'Sin reclutamientos activos';
    }

    const byCard = routes.filter((one) => one === 'tarjeta').length;

    if (byCard === 0) {
      return `Depósito con las ${routes.length}`;
    }

    return byCard === routes.length
      ? `A su tarjeta con las ${routes.length}`
      : `A su tarjeta con ${byCard} de ${routes.length}`;
  }
}
