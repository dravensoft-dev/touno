import { Injectable, computed, inject, signal } from '@angular/core';
import { NOW } from './clock';
import { Platform } from './platform';
import { CALLOUTS, CUPO_CLAIMS } from './callouts.data';
import {
  CalloutDraft,
  CalloutState,
  CupoClaim,
  FreeAgentCallout,
  cuposLeft,
  holding,
  stateOf,
} from './callouts.model';

@Injectable({ providedIn: 'root' })
export class Callouts {
  private readonly platform = inject(Platform);

  private readonly calloutList = signal<readonly FreeAgentCallout[]>(CALLOUTS);

  private readonly claimList = signal<readonly CupoClaim[]>(CUPO_CLAIMS);

  private sequence = 610;

  private claimSequence = 710;

  readonly all = this.calloutList.asReadonly();

  readonly claims = this.claimList.asReadonly();

  readonly open = computed(() => this.all().filter((one) => this.stateOf(one) === 'abierto'));

  stateOf(callout: FreeAgentCallout): CalloutState {
    return stateOf(callout, this.claims());
  }

  cuposLeft(callout: FreeAgentCallout): number {
    return cuposLeft(callout, this.claims());
  }

  byId(id: string): FreeAgentCallout | undefined {
    return this.all().find((one) => one.id === id);
  }

  claimById(id: string): CupoClaim | undefined {
    return this.claims().find((one) => one.id === id);
  }

  ofBranch(branchId: string): readonly FreeAgentCallout[] {
    return this.all().filter((one) => one.branchId === branchId);
  }

  liveOf(branchId: string): FreeAgentCallout | undefined {
    return this.ofBranch(branchId).find((one) => one.closedAt === undefined);
  }

  claimsOf(calloutId: string): readonly CupoClaim[] {
    return this.claims().filter((one) => one.calloutId === calloutId);
  }

  holdingOf(riderId: string): CupoClaim | undefined {
    return holding(this.claims(), riderId);
  }

  publish(draft: CalloutDraft): FreeAgentCallout {
    if (draft.originBranchId === undefined || draft.originBranchId !== draft.branchId) {
      throw new Error('Un llamado de agentes libres lo abre la sucursal, y sólo para sí misma');
    }

    if (draft.cupos < 1) {
      throw new Error('Un llamado sin cupos es una puerta cerrada');
    }

    const floor = this.platform.riderBaseBob()['agente-libre'];

    if (draft.fixedBob < floor) {
      throw new Error(`Un llamado no puede pagar una fija menor a ${floor} Bs`);
    }

    this.sequence += 1;

    const callout: FreeAgentCallout = {
      id: `lc-${this.sequence}`,
      branchId: draft.branchId,
      companyId: draft.companyId,
      cupos: draft.cupos,
      fixedBob: draft.fixedBob,
      message: draft.message,
      openedAt: NOW,
    };

    this.calloutList.update((list) => [callout, ...list]);

    return callout;
  }

  close(id: string): void {
    this.calloutList.update((list) =>
      list.map((one) =>
        one.id === id && one.closedAt === undefined ? { ...one, closedAt: NOW } : one,
      ),
    );
  }

  claim(calloutId: string, riderId: string, eligible: boolean): CupoClaim {
    if (!eligible) {
      throw new Error('Un agente libre no puede tener ningún reclutamiento ni carreras pendientes');
    }

    if (this.holdingOf(riderId)) {
      throw new Error('Ya estás con una sucursal, y un agente libre trabaja para una a la vez');
    }

    const callout = this.byId(calloutId);

    if (!callout || this.stateOf(callout) !== 'abierto') {
      throw new Error('Ese llamado ya no tiene cupos');
    }

    this.claimSequence += 1;

    const claim: CupoClaim = {
      id: `cc-${this.claimSequence}`,
      calloutId,
      riderId,
      state: 'en-camino',
      claimedAt: NOW,
    };

    this.claimList.update((list) => [claim, ...list]);

    return claim;
  }

  arrive(id: string): void {
    this.settle(id, 'trabajando');
  }

  leave(id: string): void {
    this.settle(id, 'terminado');
  }

  abandon(id: string): void {
    this.settle(id, 'abandonado');
  }

  private settle(id: string, state: CupoClaim['state']): void {
    this.claimList.update((list) =>
      list.map((one) =>
        one.id === id
          ? {
              ...one,
              state,
              arrivedAt: state === 'trabajando' ? NOW : one.arrivedAt,
              leftAt: state === 'trabajando' ? one.leftAt : NOW,
            }
          : one,
      ),
    );
  }
}
