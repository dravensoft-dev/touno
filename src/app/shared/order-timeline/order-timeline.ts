import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { OrderTimeline } from '../../domain/orders.model';
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
  selector: 'app-order-timeline',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  templateUrl: './order-timeline.html',
  styleUrl: './order-timeline.css',
})
export class OrderTimelineView {
  readonly timeline = input.required<OrderTimeline>();
  readonly placeNames = input<Record<string, string>>({});

  protected readonly steps = computed<readonly Step[]>(() => {
    const timeline = this.timeline();
    const names = this.placeNames();

    return timeline.milestones.map((milestone) => ({
      kind: milestone.kind,
      label: milestone.label,
      stamp: milestone.at ? fechaHora(milestone.at) : undefined,
      place: milestone.place ? (names[milestone.place] ?? undefined) : undefined,
      note: milestone.note,
      reached: milestone.at !== undefined,
      current: milestone.kind === timeline.currentKind,
    }));
  });
}
