import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import {
  ArenaPageHead,
  ArenaSwitch,
  ArenaTable,
  ArenaTableCell,
  ArenaTableColumn,
  ArenaTableRow,
} from '@dravensoft/arena-angular';
import { Marketplace } from '../../../domain/marketplace';
import { Session } from '../../../domain/session';
import { bs } from '../../../domain/format';

const COLUMNS: readonly ArenaTableColumn[] = [
  { header: 'Artículo' },
  { header: 'Categoría' },
  { header: 'Precio', align: 'right' },
  { header: 'Vendidos', align: 'right' },
  { header: 'Disponible', mobileLayout: 'block' },
];

@Component({
  selector: 'app-importer-catalog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [ArenaPageHead, ArenaTable, ArenaTableRow, ArenaTableCell, ArenaSwitch],
  templateUrl: './catalog.html',
})
export class ImporterCatalog {
  private readonly marketplace = inject(Marketplace);
  private readonly session = inject(Session);

  protected readonly columns = COLUMNS;

  protected readonly slug = computed(() => this.session.profile()?.slug ?? 'importadora-ale');

  protected readonly rows = computed(() =>
    this.marketplace.catalogOf(this.slug()).map((one) => ({ ...one, price: bs(one.priceBob) })),
  );

  protected toggle(id: string, available: boolean): void {
    this.marketplace.setAvailability(id, available);
  }
}
