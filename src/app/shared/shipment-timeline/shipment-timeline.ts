import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Milestone } from '../../domain/shipping.model';
import { fechaHora } from '../../domain/format';

interface Step {
  readonly kind: string;
  readonly label: string;
  readonly stamp?: string;
  readonly place?: string;
  readonly note?: string;
  readonly reached: boolean;
  readonly current: boolean;
}

@Component({
  selector: 'app-shipment-timeline',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  templateUrl: './shipment-timeline.html',
  styleUrl: './shipment-timeline.css',
})
export class ShipmentTimeline {
  readonly milestones = input.required<readonly Milestone[]>();

  protected readonly steps = computed<readonly Step[]>(() => {
    const list = this.milestones();
    const next = list.findIndex((milestone) => milestone.at === undefined);

    return list.map((milestone, index) => ({
      kind: milestone.kind,
      label: milestone.label,
      stamp: milestone.at ? fechaHora(milestone.at) : undefined,
      place: milestone.place,
      note: milestone.note,
      reached: milestone.at !== undefined,
      current: index === next,
    }));
  });
}
