import { Injectable, computed, signal } from '@angular/core';

export interface Draft {
  readonly recipient: string;
  readonly phone: string;
  readonly city: string;
  readonly content: string;
  readonly weightKg: number;
  readonly carrierId: string;
  readonly departure: string;
  readonly payer: 'remitente' | 'destinatario';
  readonly pickupBob: number;
  readonly freightBob: number;
}

const EMPTY: Draft = {
  recipient: '',
  phone: '',
  city: '',
  content: '',
  weightKg: 1,
  carrierId: 'bolivar',
  departure: '14:00',
  payer: 'remitente',
  pickupBob: 15,
  freightBob: 50,
};

@Injectable({ providedIn: 'root' })
export class ShipmentDraft {
  private readonly draft = signal<Draft>(EMPTY);

  readonly current = this.draft.asReadonly();

  readonly totalBob = computed(() => this.draft().pickupBob + this.draft().freightBob);

  readonly ready = computed(() => {
    const draft = this.draft();

    return draft.recipient.trim() !== '' && draft.city !== '' && draft.content.trim() !== '';
  });

  patch(change: Partial<Draft>): void {
    this.draft.update((current) => ({ ...current, ...change }));
  }

  reset(): void {
    this.draft.set(EMPTY);
  }
}
