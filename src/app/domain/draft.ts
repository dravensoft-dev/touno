import { Injectable, computed, signal } from '@angular/core';
import { DeliveryChoice } from './orders.model';

export interface CheckoutDraft {
  readonly delivery: DeliveryChoice;
  readonly address: string;
  readonly destinationBranchId: string;
  readonly note: string;
}

const EMPTY: CheckoutDraft = {
  delivery: 'domicilio',
  address: '',
  destinationBranchId: '',
  note: '',
};

@Injectable({ providedIn: 'root' })
export class Checkout {
  private readonly state = signal<CheckoutDraft>(EMPTY);

  readonly current = this.state.asReadonly();

  readonly ready = computed(() => {
    const draft = this.state();

    return draft.delivery === 'sucursal'
      ? draft.destinationBranchId !== ''
      : draft.address.trim() !== '';
  });

  patch(change: Partial<CheckoutDraft>): void {
    this.state.update((one) => ({ ...one, ...change }));
  }

  reset(): void {
    this.state.set(EMPTY);
  }
}
