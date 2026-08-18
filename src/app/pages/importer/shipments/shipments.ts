import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  ArenaActions,
  ArenaAlert,
  ArenaButton,
  ArenaEmptyState,
  ArenaInput,
  ArenaPageHead,
  ArenaSegmentOption,
  ArenaSegmentedControl,
  ArenaTable,
  ArenaTableCell,
  ArenaTableColumn,
  ArenaTableRow,
} from '@dravensoft/arena-angular';
import { Session } from '../../../domain/session';
import { Shipping } from '../../../domain/shipping';
import { bs, hhmm } from '../../../domain/format';
import { StatusTag } from '../../../shared/status-tag/status-tag';

const COLUMNS: readonly ArenaTableColumn[] = [
  { header: 'Guía', mono: true },
  { header: 'Destinatario' },
  { header: 'Destino' },
  { header: 'Estado' },
  { header: 'Llega', align: 'right' },
  { header: 'Total', align: 'right' },
];

const FILTERS: readonly ArenaSegmentOption[] = [
  { value: 'activos', label: 'Activos' },
  { value: 'entregados', label: 'Entregados' },
  { value: 'todos', label: 'Todos' },
];

@Component({
  selector: 'app-importer-shipments',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [
    ArenaPageHead,
    ArenaActions,
    ArenaButton,
    ArenaAlert,
    ArenaSegmentedControl,
    ArenaInput,
    ArenaTable,
    ArenaTableRow,
    ArenaTableCell,
    ArenaEmptyState,
    StatusTag,
  ],
  templateUrl: './shipments.html',
})
export class ImporterShipments {
  private readonly router = inject(Router);
  private readonly shipping = inject(Shipping);
  protected readonly session = inject(Session);

  protected readonly columns = COLUMNS;
  protected readonly filters = FILTERS;

  protected readonly filter = signal('activos');
  protected readonly term = signal('');

  protected readonly slug = computed(() => this.session.profile()?.slug ?? 'importadora-ale');

  protected readonly mine = computed(() => this.shipping.ofImporter(this.slug()));

  protected readonly stranded = computed(() =>
    this.mine().filter((one) => one.state === 'sin-conductor'),
  );

  protected readonly activeCount = computed(
    () => this.mine().filter((one) => one.state !== 'entregado').length,
  );

  protected readonly rows = computed(() => {
    const needle = this.term().trim().toLowerCase();
    const filter = this.filter();

    return this.mine()
      .filter((one) => {
        const matchesFilter =
          filter === 'todos' ||
          (filter === 'entregados' ? one.state === 'entregado' : one.state !== 'entregado');
        const matchesTerm =
          needle === '' ||
          one.guia.toLowerCase().includes(needle) ||
          one.recipient.name.toLowerCase().includes(needle);

        return matchesFilter && matchesTerm;
      })
      .map((one) => ({
        ...one,
        eta: hhmm(one.etaAt),
        total: bs(one.totalBob),
      }));
  });

  protected pick(value: string): void {
    this.filter.set(value);
  }

  protected search(value: string): void {
    this.term.set(value);
  }

  protected open(slug: string): void {
    void this.router.navigateByUrl(`/importadora/envios/${slug}`);
  }

  protected openStranded(): void {
    const first = this.stranded()[0];

    if (first) {
      this.open(first.slug);
    }
  }

  protected create(): void {
    void this.router.navigateByUrl('/importadora/envios/nuevo');
  }
}
