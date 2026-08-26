import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import {
  ArenaBadge,
  ArenaSwitch,
  ArenaTable,
  ArenaTableCell,
  ArenaTableColumn,
  ArenaTableRow,
} from '@dravensoft/arena-angular';
import { Promotion, expired, live, usesLeft } from '../../domain/promotions.model';
import { bs, fecha, porcentaje } from '../../domain/format';
import { discountLabel } from '../discount-label';

export type PromotionAudience = 'compradores' | 'riders';

const BUYER_COLUMNS: readonly ArenaTableColumn[] = [
  { header: 'Código', mono: true },
  { header: 'Qué descuenta' },
  { header: 'Usos', align: 'right' },
  { header: 'Hasta' },
  { header: 'Estado' },
];

const RIDER_COLUMNS: readonly ArenaTableColumn[] = [
  { header: 'Código', mono: true },
  { header: 'La fija', align: 'right' },
  { header: 'Bono', align: 'right' },
  { header: 'Garantía', align: 'right' },
  { header: 'Hasta' },
  { header: 'Estado' },
];

const SWITCH_COLUMN: ArenaTableColumn = { header: 'Encendida' };

@Component({
  selector: 'app-promotion-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [ArenaTable, ArenaTableRow, ArenaTableCell, ArenaBadge, ArenaSwitch],
  templateUrl: './promotion-table.html',
})
export class PromotionTable {
  readonly promotions = input.required<readonly Promotion[]>();
  readonly audience = input.required<PromotionAudience>();
  readonly label = input('Promociones');
  readonly switchable = input(false);
  readonly interactive = input(false);

  readonly chosen = output<Promotion>();
  readonly switched = output<Promotion>();

  protected readonly forRiders = computed(() => this.audience() === 'riders');

  protected readonly columns = computed(() => {
    const base = this.forRiders() ? RIDER_COLUMNS : BUYER_COLUMNS;

    return this.switchable() ? [...base, SWITCH_COLUMN] : base;
  });

  protected money(amount: number): string {
    return bs(amount);
  }

  protected dateOf(until: string): string {
    return fecha(until);
  }

  protected valueOf(promotion: Promotion): string {
    return discountLabel(promotion.discount);
  }

  protected gateOf(promotion: Promotion): string {
    const gate = promotion.discount?.minReputationPct;

    return gate === undefined ? '' : ` · pide ${porcentaje(gate)} de reputación`;
  }

  protected usesOf(promotion: Promotion): string {
    return `${promotion.uses} de ${promotion.limit} · le quedan ${usesLeft(promotion)}`;
  }

  protected stateOf(promotion: Promotion): string {
    if (!promotion.active) {
      return 'Apagada';
    }

    if (expired(promotion)) {
      return 'Vencida';
    }

    return live(promotion) ? 'Corriendo' : 'Agotada';
  }

  protected toneOf(promotion: Promotion): 'success' | 'neutral' | 'warning' {
    if (live(promotion)) {
      return 'success';
    }

    return promotion.active ? 'warning' : 'neutral';
  }
}
