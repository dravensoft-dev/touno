import { Injectable, computed, signal } from '@angular/core';
import { PlatformConfig, orderedBases } from './platform.model';
import { PLATFORM } from './platform.data';

@Injectable({ providedIn: 'root' })
export class Platform {
  private readonly state = signal<PlatformConfig>(PLATFORM);

  readonly config = this.state.asReadonly();

  readonly commissionPct = computed(() => this.config().commissionPct);

  readonly minDeliveryFeeBob = computed(() => this.config().minDeliveryFeeBob);

  readonly weatherFeeBob = computed(() => this.config().weatherFeeBob);

  readonly minRuns = computed(() => this.config().minRuns);

  readonly minReputationPct = computed(() => this.config().minReputationPct);

  readonly riderBaseBob = computed(() => this.config().riderBaseBob);

  patch(change: Partial<PlatformConfig>): void {
    const next = { ...this.state(), ...change };

    if (!orderedBases(next.riderBaseBob)) {
      throw new Error('La fija sube con el compromiso: agente libre, normal y hora pico.');
    }

    this.state.set(next);
  }
}
