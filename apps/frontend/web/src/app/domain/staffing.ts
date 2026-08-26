import { Injectable, inject } from '@angular/core';
import { Agreements } from './agreements';
import { Callouts } from './callouts';
import { Riders } from './riders';
import { WorkMode } from './agreements.model';
import { Rider } from './riders.model';

@Injectable({ providedIn: 'root' })
export class Staffing {
  private readonly agreements = inject(Agreements);
  private readonly callouts = inject(Callouts);
  private readonly riders = inject(Riders);

  ridersOf(branchId: string): readonly Rider[] {
    const recruited = this.agreements.ridersOf(branchId);
    const free = this.freeAgentsOf(branchId).filter(
      (one) => !recruited.some((two) => two.id === one.id),
    );

    return [...recruited, ...free];
  }

  freeAgentsOf(branchId: string): readonly Rider[] {
    return this.callouts
      .ofBranch(branchId)
      .flatMap((one) => this.callouts.claimsOf(one.id))
      .filter((one) => one.state === 'trabajando')
      .map((one) => this.riders.byId(one.riderId))
      .filter((one): one is Rider => one !== undefined);
  }

  bondOf(riderId: string, branchId: string): WorkMode | undefined {
    const agreement = this.agreements.chargeable(riderId, branchId);

    if (agreement) {
      return agreement.kind;
    }

    return this.freeAgentsOf(branchId).some((one) => one.id === riderId)
      ? 'agente-libre'
      : undefined;
  }

  covers(riderId: string, branchId: string): boolean {
    return this.bondOf(riderId, branchId) !== undefined;
  }
}
