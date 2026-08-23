import { Injectable, computed, inject, signal } from '@angular/core';
import { NOW } from './clock';
import { Riders } from './riders';
import { Rider } from './riders.model';
import { Platform } from './platform';
import {
  AgreementDraft,
  AgreementSide,
  PEAK_REASONS,
  PeakAsk,
  PeakRefusal,
  RiderAgreement,
  canTakePeak,
  kindLabel,
  peakRefusal,
  runsPending,
} from './agreements.model';
import { AGREEMENTS } from './agreements.data';

@Injectable({ providedIn: 'root' })
export class Agreements {
  private readonly platform = inject(Platform);
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

  fulfilledFor(riderId: string): readonly RiderAgreement[] {
    return this.ofRider(riderId).filter((one) => one.state === 'cumplido');
  }

  runsPendingOf(riderId: string): number {
    return runsPending(this.ofRider(riderId));
  }

  refusalFor(riderId: string, ask: PeakAsk, exceptId?: string): PeakRefusal | undefined {
    return peakRefusal(this.ofRider(riderId), ask, exceptId);
  }

  reasonFor(riderId: string, ask: PeakAsk): string | undefined {
    const refusal = this.refusalFor(riderId, ask);

    return refusal ? PEAK_REASONS[refusal] : undefined;
  }

  canTakePeakFor(riderId: string, ask: PeakAsk): boolean {
    return canTakePeak(this.ofRider(riderId), ask);
  }

  chargeable(riderId: string, branchId: string): RiderAgreement | undefined {
    return [...this.activeFor(riderId)]
      .filter((one) => one.branchIds.includes(branchId) && one.runsLeft > 0)
      .sort(
        (left, right) =>
          Number(right.kind === 'hora-pico') - Number(left.kind === 'hora-pico') ||
          left.runsLeft - right.runsLeft ||
          left.id.localeCompare(right.id),
      )[0];
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
    if (draft.branchIds.length === 0) {
      throw new Error('El reclutamiento no cubre ninguna sucursal');
    }

    if (
      draft.proposerPct !== undefined &&
      draft.floorPct !== undefined &&
      draft.proposerPct < draft.floorPct
    ) {
      throw new Error(
        'Esta sucursal está por debajo del piso de reputación de Touno y no puede reclutar',
      );
    }

    const minimum = this.platform.minRuns();

    if (draft.runs < minimum) {
      throw new Error(
        `Un ${kindLabel(draft.kind).toLowerCase()} no puede dar menos de ${minimum} carreras`,
      );
    }

    if (draft.kind === 'hora-pico') {
      const refusal = this.refusalFor(draft.riderId, draft);

      if (refusal) {
        throw new Error(PEAK_REASONS[refusal]);
      }
    }

    this.sequence += 1;

    const agreement: RiderAgreement = {
      id: `ag-${this.sequence}`,
      riderId: draft.riderId,
      companyId: draft.companyId,
      branchIds: draft.branchIds,
      initiatedBy: draft.initiatedBy,
      originBranchId: draft.originBranchId,
      kind: draft.kind,
      state: 'pendiente',
      perTripBob: draft.perTripBob,
      runs: draft.runs,
      runsLeft: draft.runs,
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

  spend(riderId: string, branchId: string): RiderAgreement | undefined {
    const target = this.chargeable(riderId, branchId);

    if (!target) {
      return undefined;
    }

    const left = target.runsLeft - 1;
    const next: RiderAgreement =
      left === 0
        ? { ...target, runsLeft: 0, state: 'cumplido', settledAt: NOW }
        : { ...target, runsLeft: left };

    this.agreementList.update((list) => list.map((one) => (one.id === target.id ? next : one)));

    return next;
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

    if (state === 'activo' && agreement.kind === 'hora-pico') {
      const refusal = this.refusalFor(agreement.riderId, agreement, agreement.id);

      if (refusal) {
        throw new Error(PEAK_REASONS[refusal]);
      }
    }

    this.agreementList.update((list) =>
      list.map((one) => (one.id === id ? { ...one, state, settledAt: NOW } : one)),
    );
  }
}
