import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import {
  ArenaButton,
  ArenaEmptyState,
  ArenaPeopleList,
  ArenaPersonRow,
} from '@dravensoft/arena-angular';
import { Agreements } from '../../domain/agreements';
import { Riders } from '../../domain/riders';
import { AssignmentLeg } from '../../domain/orders.model';
import { Rider, rangeOf, vehicleLabel } from '../../domain/riders.model';
import { porcentaje } from '../../domain/format';

interface Candidate {
  readonly rider: Rider;
  readonly secondary: string;
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
  private readonly agreements = inject(Agreements);
  private readonly riders = inject(Riders);

  readonly branchId = input.required<string>();
  readonly leg = input<AssignmentLeg>('origen');
  readonly label = input('Riders que trabajan con esta sucursal');
  readonly assign = output<Rider>();

  protected readonly candidates = computed<readonly Candidate[]>(() => {
    const wanted = this.leg() === 'interurbano' ? 'interurbano' : 'urbano';

    return this.agreements
      .ridersOf(this.branchId())
      .filter((one) => rangeOf(one.vehicle) === wanted)
      .map((rider) => ({
        rider,
        secondary: `${vehicleLabel(rider.vehicle)} · ${rider.plate} · ${porcentaje(rider.onTimePct)} a tiempo`,
        free: rider.online,
      }));
  });

  protected readonly free = computed(() => this.candidates().filter((one) => one.free));

  protected readonly busy = computed(() => this.candidates().filter((one) => !one.free));

  protected pick(rider: Rider): void {
    this.assign.emit(rider);
  }
}
