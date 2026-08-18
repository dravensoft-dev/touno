import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  ArenaButton,
  ArenaInput,
  ArenaKeyValue,
  ArenaKeyValueRow,
  ArenaPageHead,
  ArenaRadio,
  ArenaRadioGroup,
  ArenaSelect,
  ArenaSelectOption,
  ArenaTextarea,
} from '@dravensoft/arena-angular';
import { ShipmentDraft } from '../../../domain/draft';
import { Shipping } from '../../../domain/shipping';
import { Session } from '../../../domain/session';
import { bs } from '../../../domain/format';

@Component({
  selector: 'app-importer-new-shipment',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [
    ArenaPageHead,
    ArenaInput,
    ArenaSelect,
    ArenaTextarea,
    ArenaRadioGroup,
    ArenaRadio,
    ArenaKeyValue,
    ArenaButton,
  ],
  templateUrl: './new-shipment.html',
})
export class ImporterNewShipment {
  private readonly router = inject(Router);
  private readonly shipping = inject(Shipping);
  private readonly session = inject(Session);

  protected readonly draft = inject(ShipmentDraft);

  protected readonly origin = computed(
    () => this.session.profile()?.place.split(' · ')[0] ?? 'La Paz',
  );

  protected readonly cities = computed<readonly ArenaSelectOption[]>(() =>
    [...new Set(this.shipping.branches.map((one) => one.city))]
      .filter((city) => city !== this.origin())
      .map((city) => ({ value: city, label: city })),
  );

  protected readonly carriers = computed(() =>
    this.shipping.carriers.filter((carrier) =>
      carrier.branches.some(
        (id) => this.shipping.branchById(id)?.city === this.draft.current().city,
      ),
    ),
  );

  protected readonly summary = computed<readonly ArenaKeyValueRow[]>(() => {
    const draft = this.draft.current();

    return [
      { term: 'Recojo en tu tienda', value: bs(draft.pickupBob), numeric: true },
      {
        term: `Encomienda a ${draft.city || 'destino'}`,
        value: bs(draft.freightBob),
        numeric: true,
      },
    ];
  });

  protected readonly total = computed<ArenaKeyValueRow>(() => ({
    term: 'Total a pagar',
    value: bs(this.draft.totalBob()),
    numeric: true,
  }));

  protected pickCity(city: string): void {
    const tariff = this.shipping.tariffFor(this.origin(), city);

    this.draft.patch({
      city,
      freightBob: tariff?.freightBob ?? 50,
      pickupBob: tariff?.pickupBob ?? 15,
      carrierId: tariff?.carrierId ?? 'bolivar',
    });
  }

  protected pickCarrier(carrierId: string): void {
    const carrier = this.shipping.carrierById(carrierId);

    this.draft.patch({ carrierId, departure: carrier?.departures[0] ?? '14:00' });
  }

  protected departuresOf(carrierId: string): string {
    return this.shipping.carrierById(carrierId)?.departures.join(' · ') ?? '';
  }

  protected toPayment(): void {
    void this.router.navigateByUrl('/importadora/envios/nuevo/pago');
  }
}
