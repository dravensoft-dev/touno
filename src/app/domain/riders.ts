import { Injectable, computed, signal } from '@angular/core';
import { Card, PayoutMethod } from './payments.model';
import { Payout, Rider, RiderRange, Vehicle, rangeOf } from './riders.model';
import { PAYOUTS, RIDERS } from './riders.data';

@Injectable({ providedIn: 'root' })
export class Riders {
  private readonly riderList = signal<readonly Rider[]>(RIDERS);

  readonly all = this.riderList.asReadonly();

  readonly payouts: readonly Payout[] = PAYOUTS;

  readonly online = computed(() => this.all().filter((one) => one.online));

  readonly weekTrips = computed(() => this.payouts.reduce((sum, one) => sum + one.trips, 0));

  readonly weekEarnings = computed(() => this.payouts.reduce((sum, one) => sum + one.earnBob, 0));

  byId(id: string): Rider | undefined {
    return this.all().find((one) => one.id === id);
  }

  bySlug(slug: string): Rider | undefined {
    return this.all().find((one) => one.slug === slug);
  }

  nameOf(id: string): string {
    return this.byId(id)?.name ?? '';
  }

  rangeOfRider(id: string): RiderRange | undefined {
    const rider = this.byId(id);

    return rider && rangeOf(rider.vehicle);
  }

  inCity(cityId: string): readonly Rider[] {
    return this.all().filter((one) => one.cityId === cityId);
  }

  ofRange(range: RiderRange): readonly Rider[] {
    return this.all().filter((one) => rangeOf(one.vehicle) === range);
  }

  search(term: string, cityId?: string): readonly Rider[] {
    const needle = term.trim().toLowerCase();

    return this.all()
      .filter((one) => cityId === undefined || one.cityId === cityId)
      .filter(
        (one) =>
          needle === '' ||
          one.name.toLowerCase().includes(needle) ||
          one.zones.some((zone) => zone.toLowerCase().includes(needle)),
      );
  }

  drives(id: string, vehicle: Vehicle): boolean {
    return this.byId(id)?.vehicle === vehicle;
  }

  setPayoutMethod(id: string, payoutMethod: PayoutMethod): void {
    this.riderList.update((list) =>
      list.map((one) => (one.id === id ? { ...one, payoutMethod } : one)),
    );
  }

  setCard(id: string, card: Card | undefined): void {
    this.riderList.update((list) => list.map((one) => (one.id === id ? { ...one, card } : one)));
  }

  setOnline(id: string, online: boolean): void {
    this.riderList.update((list) => list.map((one) => (one.id === id ? { ...one, online } : one)));
  }
}
