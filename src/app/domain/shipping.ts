import { Injectable, computed, signal } from '@angular/core';
import { Branch, Carrier, Manifest, Shipment, Tariff } from './shipping.model';
import { BRANCHES, CARRIERS, MANIFESTS, SHIPMENTS, TARIFFS } from './shipping.data';

const CLOSED: readonly Shipment['state'][] = ['entregado'];

@Injectable({ providedIn: 'root' })
export class Shipping {
  private readonly shipments = signal<readonly Shipment[]>(SHIPMENTS);

  readonly all = this.shipments.asReadonly();

  readonly carriers: readonly Carrier[] = CARRIERS;

  readonly branches: readonly Branch[] = BRANCHES;

  readonly tariffs: readonly Tariff[] = TARIFFS;

  readonly manifests: readonly Manifest[] = MANIFESTS;

  readonly active = computed(() => this.all().filter((one) => !CLOSED.includes(one.state)));

  readonly delivered = computed(() => this.all().filter((one) => CLOSED.includes(one.state)));

  readonly stranded = computed(() => this.all().filter((one) => one.state === 'sin-conductor'));

  readonly toCollect = computed(() =>
    this.all()
      .filter((one) => one.payer === 'destinatario' && !one.paid)
      .reduce((sum, one) => sum + one.totalBob, 0),
  );

  ofImporter(slug: string): readonly Shipment[] {
    return this.all().filter((one) => one.importerSlug === slug);
  }

  bySlug(slug: string): Shipment | undefined {
    return this.all().find((one) => one.slug === slug);
  }

  byGuia(code: string): Shipment | undefined {
    return this.all().find((one) => one.guia === code);
  }

  branchById(id: string): Branch | undefined {
    return this.branches.find((one) => one.id === id);
  }

  carrierById(id: string): Carrier | undefined {
    return this.carriers.find((one) => one.id === id);
  }

  tariffFor(fromCity: string, toCity: string): Tariff | undefined {
    return this.tariffs.find((one) => one.fromCity === fromCity && one.toCity === toCity);
  }

  destinationTally(slug: string): readonly { city: string; count: number }[] {
    const tally = new Map<string, number>();

    for (const shipment of this.ofImporter(slug)) {
      tally.set(shipment.destination.city, (tally.get(shipment.destination.city) ?? 0) + 1);
    }

    return [...tally.entries()]
      .map(([city, count]) => ({ city, count }))
      .sort((left, right) => right.count - left.count);
  }

  assign(slug: string, driverId: string): void {
    this.shipments.update((list) =>
      list.map((one) =>
        one.slug === slug ? { ...one, driverId, state: 'en-camino-a-sucursal' } : one,
      ),
    );
  }
}
