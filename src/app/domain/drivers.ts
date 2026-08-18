import { Injectable, computed, signal } from '@angular/core';
import { Driver, Payout, Ride } from './drivers.model';
import { DRIVERS, PAYOUTS, RIDES } from './drivers.data';

@Injectable({ providedIn: 'root' })
export class Drivers {
  private readonly drivers = signal<readonly Driver[]>(DRIVERS);
  private readonly rides = signal<readonly Ride[]>(RIDES);

  readonly all = this.drivers.asReadonly();

  readonly payouts: readonly Payout[] = PAYOUTS;

  readonly available = computed(() => this.all().filter((one) => one.available));

  readonly zones = computed(() => [...new Set(this.all().flatMap((one) => one.zones))].sort());

  byId(id: string): Driver | undefined {
    return this.all().find((one) => one.id === id);
  }

  bySlug(slug: string): Driver | undefined {
    return this.all().find((one) => one.slug === slug);
  }

  search(term: string, zone: string): readonly Driver[] {
    const needle = term.trim().toLowerCase();

    return this.all().filter((one) => {
      const matchesTerm =
        needle === '' ||
        one.name.toLowerCase().includes(needle) ||
        one.plate.toLowerCase().includes(needle);
      const matchesZone = zone === '' || one.zones.includes(zone);

      return matchesTerm && matchesZone;
    });
  }

  ridesOf(driverId: string): readonly Ride[] {
    return this.rides().filter((one) => one.driverId === driverId);
  }

  offered(): readonly Ride[] {
    return this.rides().filter((one) => one.state === 'ofrecida');
  }

  rideById(id: string): Ride | undefined {
    return this.rides().find((one) => one.id === id);
  }

  weekEarnings(): number {
    return this.payouts.reduce((sum, one) => sum + one.earnBob, 0);
  }

  weekRides(): number {
    return this.payouts.reduce((sum, one) => sum + one.rides, 0);
  }

  setAvailable(id: string, available: boolean): void {
    this.drivers.update((list) => list.map((one) => (one.id === id ? { ...one, available } : one)));
  }

  advanceRide(id: string, state: Ride['state']): void {
    this.rides.update((list) => list.map((one) => (one.id === id ? { ...one, state } : one)));
  }

  markPhoto(id: string): void {
    this.rides.update((list) =>
      list.map((one) => (one.id === id ? { ...one, photoTaken: true } : one)),
    );
  }
}
