import { Injectable, computed, inject, signal } from '@angular/core';
import { NOW } from './clock';
import { Riders } from './riders';
import { Rider } from './riders.model';
import { AgreementDraft, AgreementSide, RiderAgreement } from './agreements.model';
import { AGREEMENTS } from './agreements.data';

@Injectable({ providedIn: 'root' })
export class Agreements {
  private readonly riders = inject(Riders);

  private readonly agreementList = signal<readonly RiderAgreement[]>(AGREEMENTS);

  private sequence = 600;

  readonly all = this.agreementList.asReadonly();

  readonly active = computed(() => this.all().filter((one) => one.state === 'activo'));

  readonly pending = computed(() => this.all().filter((one) => one.state === 'pendiente'));

  byId(id: string): RiderAgreement | undefined {
    return this.all().find((one) => one.id === id);
  }

  ofRider(riderId: string): readonly RiderAgreement[] {
    return this.all().filter((one) => one.riderId === riderId);
  }

  ofCompany(companyId: string): readonly RiderAgreement[] {
    return this.all().filter((one) => one.companyId === companyId);
  }

  ofBranch(branchId: string): readonly RiderAgreement[] {
    return this.all().filter((one) => one.branchIds.includes(branchId));
  }

  activeFor(riderId: string): readonly RiderAgreement[] {
    return this.ofRider(riderId).filter((one) => one.state === 'activo');
  }

  awaiting(side: AgreementSide, actorId: string): readonly RiderAgreement[] {
    return this.pending().filter(
      (one) => one.initiatedBy !== side && this.actorOf(one, side) === actorId,
    );
  }

  covers(riderId: string, branchId: string): boolean {
    return this.activeFor(riderId).some((one) => one.branchIds.includes(branchId));
  }

  ridersOf(branchId: string): readonly Rider[] {
    return this.ofBranch(branchId)
      .filter((one) => one.state === 'activo')
      .map((one) => this.riders.byId(one.riderId))
      .filter((one): one is Rider => one !== undefined);
  }

  branchesFor(riderId: string): readonly string[] {
    return [...new Set(this.activeFor(riderId).flatMap((one) => one.branchIds))];
  }

  between(riderId: string, companyId: string): RiderAgreement | undefined {
    return this.ofRider(riderId).find(
      (one) => one.companyId === companyId && (one.state === 'activo' || one.state === 'pendiente'),
    );
  }

  propose(draft: AgreementDraft): RiderAgreement {
    this.sequence += 1;

    const agreement: RiderAgreement = {
      id: `ag-${this.sequence}`,
      riderId: draft.riderId,
      companyId: draft.companyId,
      branchIds: draft.branchIds,
      initiatedBy: draft.initiatedBy,
      state: 'pendiente',
      perTripBob: draft.perTripBob,
      message: draft.message,
      sentAt: NOW,
      validUntil: '2026-12-31',
    };

    this.agreementList.update((list) => [agreement, ...list]);

    return agreement;
  }

  accept(id: string, side: AgreementSide, actorId: string): void {
    this.settle(id, side, actorId, 'activo');
  }

  reject(id: string, side: AgreementSide, actorId: string): void {
    this.settle(id, side, actorId, 'rechazado');
  }

  end(id: string): void {
    this.agreementList.update((list) =>
      list.map((one) =>
        one.id === id && one.state === 'activo'
          ? { ...one, state: 'terminado', settledAt: NOW }
          : one,
      ),
    );
  }

  private actorOf(agreement: RiderAgreement, side: AgreementSide): string {
    return side === 'rider' ? agreement.riderId : agreement.companyId;
  }

  private settle(
    id: string,
    side: AgreementSide,
    actorId: string,
    state: 'activo' | 'rechazado',
  ): void {
    const agreement = this.byId(id);

    if (!agreement) {
      throw new Error(`No existe el acuerdo ${id}`);
    }

    if (agreement.state !== 'pendiente') {
      throw new Error(`El acuerdo ${id} ya fue respondido`);
    }

    if (agreement.initiatedBy === side) {
      throw new Error(`El acuerdo ${id} lo propuso esta misma parte`);
    }

    if (this.actorOf(agreement, side) !== actorId) {
      throw new Error(`El acuerdo ${id} no está dirigido a ${actorId}`);
    }

    this.agreementList.update((list) =>
      list.map((one) => (one.id === id ? { ...one, state, settledAt: NOW } : one)),
    );
  }
}
