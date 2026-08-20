import { Injectable, computed, signal } from '@angular/core';
import { NOW } from './clock';
import { LoadState, TruckLoad } from './loads.model';
import { TRUCK_LOADS } from './loads.data';

@Injectable({ providedIn: 'root' })
export class Loads {
  private readonly loadList = signal<readonly TruckLoad[]>(TRUCK_LOADS);

  readonly all = this.loadList.asReadonly();

  readonly filling = computed(() => this.all().filter((one) => one.state === 'acumulando'));

  readonly travelling = computed(() => this.all().filter((one) => one.state === 'en-ruta'));

  byId(id: string): TruckLoad | undefined {
    return this.all().find((one) => one.id === id);
  }

  ofOrder(code: string): TruckLoad | undefined {
    return this.all().find((one) => one.orderCodes.includes(code));
  }

  ofRider(riderId: string): readonly TruckLoad[] {
    return this.all().filter((one) => one.riderId === riderId);
  }

  leaving(branchId: string): readonly TruckLoad[] {
    return this.all().filter((one) => one.fromBranchId === branchId && one.state !== 'descargado');
  }

  arriving(branchId: string): readonly TruckLoad[] {
    return this.all().filter((one) => one.toBranchId === branchId && one.state === 'en-ruta');
  }

  missing(id: string): number {
    const load = this.byId(id);

    return load ? Math.max(0, load.capacity - load.orderCodes.length) : 0;
  }

  isFull(id: string): boolean {
    return this.missing(id) === 0;
  }

  add(id: string, code: string): void {
    this.loadList.update((list) =>
      list.map((one) =>
        one.id === id && one.state === 'acumulando' && !one.orderCodes.includes(code)
          ? { ...one, orderCodes: [...one.orderCodes, code] }
          : one,
      ),
    );
  }

  advance(id: string, state: LoadState): void {
    this.loadList.update((list) => list.map((one) => (one.id === id ? { ...one, state } : one)));
  }

  depart(id: string): void {
    this.loadList.update((list) =>
      list.map((one) =>
        one.id === id && one.state === 'acumulando'
          ? { ...one, state: 'en-ruta', departsAt: NOW }
          : one,
      ),
    );
  }
}
