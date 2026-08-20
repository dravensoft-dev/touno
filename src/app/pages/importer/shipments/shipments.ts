import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  ArenaActions,
  ArenaAlert,
  ArenaButton,
  ArenaEmptyState,
  ArenaIconButton,
  ArenaInput,
  ArenaMenu,
  ArenaMenuItem,
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
import { copyText } from '../../../domain/clipboard';
import { Notices } from '../../../layout/notices';
import { StatusTag } from '../../../shared/status-tag/status-tag';

const COLUMNS: readonly ArenaTableColumn[] = [
  { header: 'Guía', mono: true },
  { header: 'Destinatario' },
  { header: 'Destino' },
  { header: 'Estado' },
  { header: 'Llega', align: 'right' },
  { header: 'Total', align: 'right' },
  { header: 'Acciones', align: 'right', mobileLayout: 'block' },
];

const OPEN_ROW = 'Ver el envío';
const TRACK_ROW = 'Ver el seguimiento';
const COPY_ROW = 'Copiar la guía';

const ROW_ACTIONS: readonly ArenaMenuItem[] = [
  { label: OPEN_ROW, icon: 'ph-bold ph-arrow-right' },
  { label: TRACK_ROW, icon: 'ph-bold ph-map-pin-simple-area' },
  { label: COPY_ROW, icon: 'ph-bold ph-copy' },
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
    ArenaMenu,
    ArenaIconButton,
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
  private readonly notices = inject(Notices);

  protected readonly columns = COLUMNS;
  protected readonly filters = FILTERS;
  protected readonly rowActions = ROW_ACTIONS;

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

  protected runOn(
    row: { readonly slug: string; readonly guia: string },
    item: ArenaMenuItem,
  ): void {
    if (item.label === OPEN_ROW) {
      this.open(row.slug);

      return;
    }

    if (item.label === TRACK_ROW) {
      void this.router.navigateByUrl(`/seguimiento/${row.slug}`);

      return;
    }

    this.copy(row.guia);
  }

  private copy(guia: string): void {
    void copyText(guia).then((done) =>
      done ? this.notices.guiaCopied(guia) : this.notices.guiaNotCopied(guia),
    );
  }
}
