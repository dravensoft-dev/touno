import { Injectable, computed, inject } from '@angular/core';
import { Agreements } from './agreements';
import { Businesses } from './businesses';
import { Loads } from './loads';
import { Orders } from './orders';
import { Platform } from './platform';
import { REPUTATION_HISTORY } from './reputation.data';
import {
  FactCount,
  ReputationEvent,
  ReputationGate,
  Standing,
  countsOf,
  factsOfAgreement,
  factsOfLoad,
  factsOfOrder,
  meetsFloor,
  mergeStandings,
  standingOf,
} from './reputation.model';

@Injectable({ providedIn: 'root' })
export class Reputation {
  private readonly orders = inject(Orders);
  private readonly agreements = inject(Agreements);
  private readonly loads = inject(Loads);
  private readonly businesses = inject(Businesses);
  private readonly platform = inject(Platform);

  readonly history = REPUTATION_HISTORY;

  private readonly live = computed<readonly ReputationEvent[]>(() => [
    ...this.orders.all().flatMap((one) => factsOfOrder(one)),
    ...this.agreements.all().flatMap((one) => factsOfAgreement(one)),
    ...this.loads.all().flatMap((one) => factsOfLoad(one)),
  ]);

  breakdownOf(subjectId: string): readonly FactCount[] {
    return countsOf(
      this.history.filter((one) => one.subjectId === subjectId),
      this.live().filter((one) => one.subjectId === subjectId),
    );
  }

  of(subjectId: string): Standing {
    return standingOf(this.breakdownOf(subjectId));
  }

  ofCompany(companyId: string): Standing {
    return mergeStandings(this.businesses.branchesOf(companyId).map((one) => this.of(one.id)));
  }

  clears(subjectId: string): boolean {
    return meetsFloor(this.of(subjectId), this.platform.minReputationPct());
  }

  bestFirst<T extends { readonly id: string; readonly name: string }>(
    list: readonly T[],
  ): readonly T[] {
    return list
      .slice()
      .sort(
        (left, right) =>
          this.of(right.id).pct - this.of(left.id).pct || left.name.localeCompare(right.name),
      );
  }

  gated<T extends ReputationGate>(riderId: string, ask: T): T {
    const proposers = ask.originBranchId ? [ask.originBranchId] : ask.branchIds;

    return {
      ...ask,
      riderPct: this.pctOrNothing(riderId),
      proposerPct: this.weakestOf(proposers),
      floorPct: this.platform.minReputationPct(),
    };
  }

  private pctOrNothing(subjectId: string): number | undefined {
    const standing = this.of(subjectId);

    return standing.totalCount === 0 ? undefined : standing.pct;
  }

  private weakestOf(subjectIds: readonly string[]): number | undefined {
    const known = subjectIds
      .map((one) => this.pctOrNothing(one))
      .filter((one): one is number => one !== undefined);

    return known.length === 0 ? undefined : Math.min(...known);
  }
}
