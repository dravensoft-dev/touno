import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  ArenaAlert,
  ArenaBadge,
  ArenaButton,
  ArenaKeyValue,
  ArenaKeyValueRow,
  ArenaPageHead,
  ArenaTable,
  ArenaTableCell,
  ArenaTableColumn,
  ArenaTableRow,
  ArenaTextarea,
} from '@dravensoft/arena-angular';
import { Shipping } from '../../../domain/shipping';
import { bs } from '../../../domain/format';

interface BatchRow {
  readonly line: number;
  readonly recipient: string;
  readonly city: string;
  readonly content: string;
  readonly weightKg: number;
  readonly priceBob: number;
  readonly problem?: string;
}

const COLUMNS: readonly ArenaTableColumn[] = [
  { header: 'Destinatario' },
  { header: 'Destino' },
  { header: 'Contenido' },
  { header: 'Peso', align: 'right', mono: true },
  { header: 'Precio', align: 'right', mono: true },
  { header: 'Estado', mobileLayout: 'block' },
];

const SAMPLE = [
  'Rosa Villca, Santa Cruz, Ropa, 3',
  'Juan Mamani, Oruro, Zapatos, 2',
  'Ana Choque, , Cartera, 1',
  'Pedro Luna, Cochabamba, Poleras, 2',
  'Lucía Paz, Santa Cruz, Accesorios, 1',
  'Iván Rocha, Oruro, Casacas, 4',
  'Carla Mendoza, Cochabamba, Zapatillas, 2',
  'Sergio Vargas, Santa Cruz, Ropa, 3',
].join('\n');

@Component({
  selector: 'app-importer-batch',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [
    ArenaPageHead,
    ArenaTextarea,
    ArenaButton,
    ArenaAlert,
    ArenaTable,
    ArenaTableRow,
    ArenaTableCell,
    ArenaBadge,
    ArenaKeyValue,
  ],
  templateUrl: './batch.html',
})
export class ImporterBatch {
  private readonly router = inject(Router);
  private readonly shipping = inject(Shipping);

  protected readonly columns = COLUMNS;

  protected readonly pasted = signal(SAMPLE);
  protected readonly parsed = signal(false);

  protected readonly rows = computed<readonly BatchRow[]>(() => {
    if (!this.parsed()) {
      return [];
    }

    return this.pasted()
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line !== '')
      .map((line, index) => {
        const [recipient = '', city = '', content = '', weight = ''] = line
          .split(',')
          .map((part) => part.trim());
        const tariff = this.shipping.tariffFor('La Paz', city);

        return {
          line: index + 1,
          recipient,
          city,
          content,
          weightKg: Number(weight) || 1,
          priceBob: (tariff?.freightBob ?? 0) + (tariff?.pickupBob ?? 0),
          problem: city === '' ? 'Falta ciudad de destino' : undefined,
        };
      });
  });

  protected readonly valid = computed(() => this.rows().filter((row) => !row.problem));

  protected readonly broken = computed(() => this.rows().filter((row) => row.problem));

  protected readonly summary = computed<readonly ArenaKeyValueRow[]>(() => [
    { term: 'Envíos listos', value: String(this.valid().length), numeric: true },
    { term: 'Filas con problema', value: String(this.broken().length), numeric: true },
    { term: 'Recojos', value: '1', numeric: true },
  ]);

  protected readonly total = computed<ArenaKeyValueRow>(() => ({
    term: 'Total',
    value: bs(this.valid().reduce((sum, row) => sum + row.priceBob, 0)),
    numeric: true,
  }));

  protected parse(): void {
    this.parsed.set(true);
  }

  protected write(value: string): void {
    this.pasted.set(value);
    this.parsed.set(false);
  }

  protected create(): void {
    void this.router.navigateByUrl('/importadora/envios');
  }

  protected price(row: BatchRow): string {
    return bs(row.priceBob);
  }
}
