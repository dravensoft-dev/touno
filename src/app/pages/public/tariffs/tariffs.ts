import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import {
  ArenaPageHead,
  ArenaTable,
  ArenaTableCell,
  ArenaTableColumn,
  ArenaTableRow,
} from '@dravensoft/arena-angular';
import { Shipping } from '../../../domain/shipping';
import { bs } from '../../../domain/format';

const COLUMNS: readonly ArenaTableColumn[] = [
  { header: 'Origen' },
  { header: 'Destino' },
  { header: 'Empresa' },
  { header: 'Hasta', align: 'right' },
  { header: 'Encomienda', align: 'right' },
  { header: 'Recojo', align: 'right' },
  { header: 'Viaje', align: 'right' },
];

@Component({
  selector: 'app-tariffs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [ArenaPageHead, ArenaTable, ArenaTableRow, ArenaTableCell],
  templateUrl: './tariffs.html',
})
export class Tariffs {
  private readonly shipping = inject(Shipping);

  protected readonly columns = COLUMNS;

  protected readonly rows = computed(() =>
    this.shipping.tariffs.map((tariff) => ({
      ...tariff,
      key: `${tariff.fromCity}-${tariff.toCity}-${tariff.carrierId}`,
      carrier: this.shipping.carrierById(tariff.carrierId)?.name ?? tariff.carrierId,
      freight: bs(tariff.freightBob),
      pickup: bs(tariff.pickupBob),
    })),
  );
}
