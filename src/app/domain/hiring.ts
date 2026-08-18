import { Injectable, computed, signal } from '@angular/core';
import { HiringOffer } from './drivers.model';
import { HIRING_OFFERS } from './drivers.data';

@Injectable({ providedIn: 'root' })
export class Hiring {
  private readonly offers = signal<readonly HiringOffer[]>(HIRING_OFFERS);

  private sequence = HIRING_OFFERS.length;

  readonly all = this.offers.asReadonly();

  readonly pending = computed(() => this.all().filter((one) => one.state === 'pendiente'));

  byId(id: string): HiringOffer | undefined {
    return this.all().find((one) => one.id === id);
  }

  ofBusiness(slug: string): readonly HiringOffer[] {
    return this.all().filter((one) => one.businessSlug === slug);
  }

  ofDriver(driverId: string): readonly HiringOffer[] {
    return this.all().filter((one) => one.driverId === driverId);
  }

  pendingOfDriver(driverId: string): readonly HiringOffer[] {
    return this.ofDriver(driverId).filter((one) => one.state === 'pendiente');
  }

  activeWith(businessSlug: string, driverId: string): HiringOffer | undefined {
    return this.all().find(
      (one) =>
        one.businessSlug === businessSlug && one.driverId === driverId && one.state === 'aceptada',
    );
  }

  remaining(id: string): number {
    const offer = this.byId(id);

    if (!offer) {
      throw new Error(`Unknown hiring offer: ${id}`);
    }

    return offer.rides - offer.ridesUsed;
  }

  send(offer: Omit<HiringOffer, 'id' | 'ridesUsed' | 'state' | 'totalBob'>): HiringOffer {
    this.sequence += 1;

    const created: HiringOffer = {
      ...offer,
      id: `ho-${500 + this.sequence}`,
      ridesUsed: 0,
      state: 'pendiente',
      totalBob: offer.rides * offer.perRideBob,
    };

    this.offers.update((list) => [created, ...list]);

    return created;
  }

  accept(id: string, driverId: string): void {
    this.settle(id, driverId, 'aceptada');
  }

  reject(id: string, driverId: string): void {
    this.settle(id, driverId, 'rechazada');
  }

  private settle(id: string, driverId: string, state: 'aceptada' | 'rechazada'): void {
    const offer = this.byId(id);

    if (!offer) {
      throw new Error(`Unknown hiring offer: ${id}`);
    }

    if (offer.driverId !== driverId) {
      throw new Error(`Hiring offer ${id} is addressed to another driver`);
    }

    if (offer.state !== 'pendiente') {
      throw new Error(`Hiring offer ${id} is already ${offer.state}`);
    }

    this.offers.update((list) => list.map((one) => (one.id === id ? { ...one, state } : one)));
  }
}
