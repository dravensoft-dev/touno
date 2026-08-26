import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { porcentaje } from '../../domain/format';
import { FactCount, ModeStanding, Standing, factLabel } from '../../domain/reputation.model';
import { WorkMode, workModeLabel } from '../../domain/agreements.model';

@Component({
  selector: 'app-reputation-figure',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  templateUrl: './reputation-figure.html',
  styleUrl: './reputation-figure.css',
})
export class ReputationFigure {
  readonly standing = input.required<Standing>();
  readonly breakdown = input<readonly FactCount[]>([]);
  readonly label = input('Reputación');
  readonly modes = input<ModeStanding>();

  protected readonly known = computed(() => this.standing().totalCount > 0);

  protected readonly figure = computed(() => porcentaje(this.standing().pct));

  protected readonly madeOf = computed(() => {
    const one = this.standing();

    return `${one.keptCount} de ${one.totalCount} compromisos cumplidos`;
  });

  protected readonly rows = computed(() =>
    this.breakdown().map((one) => ({ label: factLabel(one.fact), count: one.count })),
  );

  protected readonly byMode = computed(() => {
    const split = this.modes();

    if (!split) {
      return [];
    }

    const order: readonly WorkMode[] = ['agente-libre', 'normal', 'hora-pico'];

    return order
      .map((mode) => ({ mode, standing: split.byMode[mode] }))
      .filter((one) => one.standing.totalCount > 0)
      .map((one) => ({
        label: workModeLabel(one.mode),
        figure: porcentaje(one.standing.pct),
        madeOf: `${one.standing.keptCount} de ${one.standing.totalCount}`,
      }));
  });
}
