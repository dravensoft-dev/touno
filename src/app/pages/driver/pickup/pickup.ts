import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import {
  ArenaAlert,
  ArenaButton,
  ArenaFallback,
  ArenaFigure,
  ArenaKeyValue,
  ArenaKeyValueRow,
  ArenaPageHead,
} from '@dravensoft/arena-angular';
import { Drivers } from '../../../domain/drivers';
import { Shipping } from '../../../domain/shipping';

@Component({
  selector: 'app-driver-pickup',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [ArenaPageHead, ArenaKeyValue, ArenaFigure, ArenaFallback, ArenaAlert, ArenaButton],
  templateUrl: './pickup.html',
})
export class DriverPickup {
  private readonly router = inject(Router);
  private readonly drivers = inject(Drivers);
  private readonly shipping = inject(Shipping);

  readonly id = input.required<string>();

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

  protected readonly facts = computed<readonly ArenaKeyValueRow[]>(() => {
    const ride = this.ride();
    const shipment = this.shipment();

    return [
      { term: 'Guía', value: shipment?.guia ?? ride.orderCode ?? ride.id, numeric: true },
      {
        term: 'Declarado',
        value: shipment ? `${shipment.content} · ${shipment.weightKg} kg` : 'Pedido de comida',
      },
      { term: 'Remitente', value: ride.pickup.label },
      { term: 'Dirección', value: ride.pickup.address },
    ];
  });

  protected takePhoto(): void {
    this.drivers.markPhoto(this.ride().id);
  }

  protected next(): void {
    this.drivers.advanceRide(this.ride().id, 'recogida');
    void this.router.navigateByUrl(`/conductor/carreras/${this.ride().id}/entrega`);
  }
}
