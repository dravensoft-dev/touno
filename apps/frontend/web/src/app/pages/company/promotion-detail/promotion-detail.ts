import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import {
  ArenaAlert,
  ArenaBadge,
  ArenaEmptyState,
  ArenaGrid,
  ArenaKeyValue,
  ArenaKeyValueRow,
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
import { Promotions } from '../../../domain/promotions';
import { Session } from '../../../domain/session';
import { RiderLegPay, riderLegPayOf } from '../../../domain/pricing';
import { expired, live, usesLeft } from '../../../domain/promotions.model';
import { bs, fecha, porcentaje } from '../../../domain/format';
import { discountLabel } from '../../../shared/discount-label';

const COLUMNS: readonly ArenaTableColumn[] = [
  { header: 'Si hace' },
  { header: 'Con su tarifa de siempre', align: 'right' },
  { header: 'Con la promoción', align: 'right' },
  { header: 'Se lleva', align: 'right' },
];

interface Step {
  readonly runs: number;
  readonly pay: RiderLegPay;
}

@Component({
  selector: 'app-company-promotion-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [
    ArenaPageHead,
    ArenaGrid,
    ArenaStatCard,
    ArenaBadge,
    ArenaAlert,
    ArenaSection,
    ArenaKeyValue,
    ArenaTable,
    ArenaTableRow,
    ArenaTableCell,
    ArenaEmptyState,
  ],
  templateUrl: './promotion-detail.html',
})
export class CompanyPromotionDetail {
  private readonly agreements = inject(Agreements);
  private readonly businesses = inject(Businesses);
  private readonly platform = inject(Platform);
  private readonly promotions = inject(Promotions);
  private readonly session = inject(Session);

  readonly code = input('');

  protected readonly columns = COLUMNS;

  protected readonly companyId = computed(() => this.session.companyId() ?? '');

  private readonly found = computed(() => this.promotions.byCode(this.code()));

  protected readonly promotion = computed(() => {
    const promotion = this.found();

    return promotion && promotion.companyId === this.companyId() ? promotion : undefined;
  });

  protected readonly notMine = computed(() => this.found() !== undefined && !this.promotion());

  protected readonly leg = computed(() => this.promotion()?.riderLeg);

  protected readonly floor = computed(() => {
    const leg = this.leg();

    return leg ? this.platform.riderBaseBob()[leg.mode] : 0;
  });

  protected readonly ordinaryBob = computed(() => {
    const leg = this.leg();

    if (!leg) {
      return 0;
    }

    const offers = this.agreements
      .ofCompany(this.companyId())
      .filter((one) => one.state === 'activo')
      .map((one) => one.perTripBob);

    return offers.length > 0 ? Math.max(...offers) : this.floor();
  });

  protected readonly steps = computed<readonly Step[]>(() => {
    const leg = this.leg();

    if (!leg) {
      return [];
    }

    const marks = [Math.max(1, Math.floor(leg.bonusAfterRuns / 4)), leg.bonusAfterRuns, 30];

    return [...new Set(marks)]
      .sort((left, right) => left - right)
      .map((runs) => ({
        runs,
        pay: riderLegPayOf({ leg, ordinaryPerTripBob: this.ordinaryBob(), runs }),
      }));
  });

  protected readonly facts = computed<readonly ArenaKeyValueRow[]>(() => {
    const promotion = this.promotion();

    if (!promotion) {
      return [];
    }

    const rows: ArenaKeyValueRow[] = [
      { term: 'Código', value: promotion.code },
      { term: 'Qué descuenta', value: this.valueLabel() },
      { term: 'Usos', value: `${promotion.uses} de ${promotion.limit}`, numeric: true },
      { term: 'Le quedan', value: usesLeft(promotion).toString(), numeric: true },
      { term: 'Hasta', value: fecha(promotion.until), numeric: true },
    ];

    const gate = promotion.discount?.minReputationPct;

    if (gate !== undefined) {
      rows.push({
        term: 'Pide de reputación',
        value: porcentaje(gate),
        numeric: true,
      });
    }

    return rows;
  });

  protected valueLabel(): string {
    const promotion = this.promotion();

    return promotion ? discountLabel(promotion.discount) : '';
  }

  protected stateLabel(): string {
    const promotion = this.promotion();

    if (!promotion) {
      return '';
    }

    if (!promotion.active) {
      return 'Apagada';
    }

    if (expired(promotion)) {
      return 'Vencida';
    }

    return usesLeft(promotion) === 0 ? 'Agotada' : 'Corriendo';
  }

  protected stateTone(): 'success' | 'warning' | 'neutral' {
    const promotion = this.promotion();

    if (!promotion) {
      return 'neutral';
    }

    if (live(promotion)) {
      return 'success';
    }

    return promotion.active ? 'warning' : 'neutral';
  }

  protected companyName(): string {
    return this.businesses.companyById(this.companyId())?.name ?? '';
  }

  protected money(amount: number): string {
    return bs(amount);
  }

  protected runsLabel(runs: number): string {
    return runs === 1 ? 'una carrera' : `${runs} carreras`;
  }
}
