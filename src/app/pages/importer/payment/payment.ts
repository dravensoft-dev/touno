import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  ArenaAlert,
  ArenaButton,
  ArenaKeyValue,
  ArenaKeyValueRow,
  ArenaPageHead,
  ArenaSegmentOption,
  ArenaSegmentedControl,
} from '@dravensoft/arena-angular';
import { ShipmentDraft } from '../../../domain/draft';
import { bs } from '../../../domain/format';
import { QrPanel } from '../../../shared/qr-panel/qr-panel';

const METHODS: readonly ArenaSegmentOption[] = [
  { value: 'qr', label: 'QR' },
  { value: 'billetera', label: 'Billetera' },
  { value: 'destinatario', label: 'Al recoger' },
];

@Component({
  selector: 'app-importer-payment',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [ArenaPageHead, ArenaSegmentedControl, ArenaKeyValue, ArenaAlert, ArenaButton, QrPanel],
  templateUrl: './payment.html',
})
export class ImporterPayment {
  private readonly router = inject(Router);

  protected readonly draft = inject(ShipmentDraft);

  protected readonly methods = METHODS;
  protected readonly method = signal('qr');

  protected readonly total = computed(() => bs(this.draft.totalBob()));

  protected readonly breakdown = computed<readonly ArenaKeyValueRow[]>(() => {
    const draft = this.draft.current();

    return [
      { term: 'Destinatario', value: draft.recipient || '—' },
      { term: 'Destino', value: draft.city || '—' },
      { term: 'Recojo', value: bs(draft.pickupBob), numeric: true },
      { term: 'Encomienda', value: bs(draft.freightBob), numeric: true },
    ];
  });

  protected readonly totalRow = computed<ArenaKeyValueRow>(() => ({
    term: 'Total',
    value: this.total(),
    numeric: true,
  }));

  protected pick(value: string): void {
    this.method.set(value);
  }

  protected confirm(): void {
    this.draft.reset();
    void this.router.navigateByUrl('/importadora/envios/ty-4471');
  }
}
