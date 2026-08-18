import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  ArenaAlert,
  ArenaButton,
  ArenaConfirmDialog,
  ArenaKeyValue,
  ArenaKeyValueRow,
  ArenaPageHead,
} from '@dravensoft/arena-angular';
import { Drivers } from '../../../domain/drivers';
import { Shipping } from '../../../domain/shipping';
import { PickupCode } from '../../../shared/pickup-code/pickup-code';

@Component({
  selector: 'app-driver-dropoff',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [ArenaPageHead, ArenaKeyValue, ArenaAlert, ArenaButton, ArenaConfirmDialog, PickupCode],
  templateUrl: './dropoff.html',
})
export class DriverDropoff {
  private readonly router = inject(Router);
  private readonly drivers = inject(Drivers);
  private readonly shipping = inject(Shipping);

  readonly id = input.required<string>();

  protected readonly confirming = signal(false);

  protected readonly ride = computed(() => {
    const ride = this.drivers.rideById(this.id());

    if (!ride) {
      throw new Error(`Unknown ride: ${this.id()}`);
    }

    return ride;
  });

  protected readonly shipment = computed(() => {
    const guia = this.ride().guia;

    return guia ? this.shipping.byGuia(guia) : undefined;
  });

  protected readonly code = computed(() => this.shipment()?.pickupCode ?? '0000');

  protected readonly facts = computed<readonly ArenaKeyValueRow[]>(() => {
    const ride = this.ride();
    const branch = this.shipping.branchById(this.shipment()?.origin.branchId ?? '');

    return [
      { term: 'Entregar en', value: ride.dropoff.label },
      { term: 'Dirección', value: ride.dropoff.address },
      { term: 'Ventanilla', value: branch?.desk ?? 'Ventanilla 3' },
      { term: 'Horario', value: branch?.window ?? 'Hasta las 22:00' },
    ];
  });

  protected ask(): void {
    this.confirming.set(true);
  }

  protected cancel(): void {
    this.confirming.set(false);
  }

  protected confirm(): void {
    this.confirming.set(false);
    this.drivers.advanceRide(this.ride().id, 'entregada');
    void this.router.navigateByUrl('/conductor/turno');
  }
}
