import { Injectable, computed, signal } from '@angular/core';
import { PlatformConfig } from './platform.model';
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

  patch(change: Partial<PlatformConfig>): void {
    this.state.update((one) => ({ ...one, ...change }));
  }
}
