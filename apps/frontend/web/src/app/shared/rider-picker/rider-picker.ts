import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import {
  ArenaButton,
  ArenaEmptyState,
  ArenaPeopleList,
  ArenaPersonRow,
} from '@dravensoft/arena-angular';
import { Reputation } from '../../domain/reputation';
import { Staffing } from '../../domain/staffing';
import { AssignmentLeg } from '../../domain/orders.model';
import { Rider, rangeOf, vehicleLabel } from '../../domain/riders.model';
import { porcentaje } from '../../domain/format';
import { Standing } from '../../domain/reputation.model';
import { WorkMode } from '../../domain/agreements.model';

interface Candidate {
  readonly rider: Rider;
  readonly secondary: string;
  readonly figure: string;
  readonly standing: Standing;
  readonly free: boolean;
}

@Component({
  selector: 'app-rider-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [ArenaPeopleList, ArenaPersonRow, ArenaButton, ArenaEmptyState],
  templateUrl: './rider-picker.html',
})
export class RiderPicker {
  private readonly reputation = inject(Reputation);
  private readonly staffing = inject(Staffing);

  readonly branchId = input.required<string>();
  readonly leg = input<AssignmentLeg>('origen');
  readonly label = input('Riders que trabajan con esta sucursal');
  readonly assign = output<Rider>();

  protected readonly candidates = computed<readonly Candidate[]>(() => {
    const wanted = this.leg() === 'interurbano' ? 'interurbano' : 'urbano';

    return this.staffing
      .ridersOf(this.branchId())
      .filter((one) => rangeOf(one.vehicle) === wanted)
      .map((rider) => {
        const standing = this.reputation.of(rider.id);
        const bond = this.staffing.bondOf(rider.id, this.branchId());

        return {
          rider,
          secondary: `${vehicleLabel(rider.vehicle)} · ${rider.plate} · ${bondLabel(bond)} · ${madeOf(standing)}`,
          figure: standing.totalCount === 0 ? '—' : porcentaje(standing.pct),
          standing,
          free: rider.online,
        };
      });
  });

  protected readonly free = computed(() =>
    this.candidates()
      .filter((one) => one.free)
      .slice()
      .sort(bestFirst),
  );

  protected readonly busy = computed(() =>
    this.candidates()
      .filter((one) => !one.free)
      .slice()
      .sort(bestFirst),
  );

  protected pick(rider: Rider): void {
    this.assign.emit(rider);
  }
}

function bondLabel(bond: WorkMode | undefined): string {
  return bond === 'agente-libre' ? 'Agente libre' : 'Reclutado';
}

function madeOf(standing: Standing): string {
  return standing.totalCount === 0
    ? 'Sin historial'
    : `${standing.keptCount} de ${standing.totalCount} cumplidos`;
}

function bestFirst(left: Candidate, right: Candidate): number {
  return right.standing.pct - left.standing.pct || left.rider.id.localeCompare(right.rider.id);
}
