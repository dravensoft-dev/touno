export type AgreementSide = 'empresa' | 'rider';

export type RecruitmentKind = 'normal' | 'hora-pico';

export type AgreementState =
  'pendiente' | 'activo' | 'cumplido' | 'rechazado' | 'terminado' | 'vencido';

export type PeakRefusal =
  'puntos-pendientes' | 'ya-tiene-hora-pico' | 'empresa-repetida' | 'alcance-de-sucursal';

export interface RiderAgreement {
  readonly id: string;
  readonly riderId: string;
  readonly companyId: string;
  readonly branchIds: readonly string[];
  readonly initiatedBy: AgreementSide;
  readonly originBranchId?: string;
  readonly kind: RecruitmentKind;
  readonly state: AgreementState;
  readonly perTripBob: number;
  readonly points: number;
  readonly pointsLeft: number;
  readonly message?: string;
  readonly sentAt: string;
  readonly validUntil: string;
  readonly settledAt?: string;
}

export interface AgreementDraft {
  readonly riderId: string;
  readonly companyId: string;
  readonly branchIds: readonly string[];
  readonly initiatedBy: AgreementSide;
  readonly originBranchId?: string;
  readonly kind: RecruitmentKind;
  readonly perTripBob: number;
  readonly points: number;
  readonly message?: string;
}

const KIND_LABELS: Record<RecruitmentKind, string> = {
  normal: 'Reclutamiento normal',
  'hora-pico': 'Reclutamiento de hora pico',
};

export const PEAK_REASONS: Record<PeakRefusal, string> = {
  'puntos-pendientes': 'Todavía le quedan puntos de carrera por cumplir en otro reclutamiento.',
  'ya-tiene-hora-pico': 'Ya tiene un reclutamiento de hora pico, y sólo puede tener uno.',
  'empresa-repetida': 'Esta empresa ya lo reclutó en hora pico una vez, y no puede repetir.',
  'alcance-de-sucursal': 'Una sucursal sólo puede reclutar en hora pico para sí misma.',
};

export function otherSide(side: AgreementSide): AgreementSide {
  return side === 'empresa' ? 'rider' : 'empresa';
}

export function kindLabel(kind: RecruitmentKind): string {
  return KIND_LABELS[kind];
}

export function owes(agreement: RiderAgreement): boolean {
  return agreement.state === 'activo' && agreement.pointsLeft > 0;
}

export function bound(state: AgreementState): boolean {
  return state !== 'rechazado' && state !== 'vencido';
}

export function heldPeak(list: readonly RiderAgreement[]): RiderAgreement | undefined {
  return list.find(
    (one) => one.kind === 'hora-pico' && (one.state === 'pendiente' || one.state === 'activo'),
  );
}

export function peakWith(
  list: readonly RiderAgreement[],
  companyId: string,
): RiderAgreement | undefined {
  return list.find(
    (one) => one.kind === 'hora-pico' && one.companyId === companyId && bound(one.state),
  );
}

export function pointsPending(list: readonly RiderAgreement[]): number {
  return list.filter(owes).reduce((sum, one) => sum + one.pointsLeft, 0);
}

export interface PeakAsk {
  readonly companyId: string;
  readonly branchIds: readonly string[];
  readonly originBranchId?: string;
}

export function peakRefusal(
  list: readonly RiderAgreement[],
  ask: PeakAsk,
  exceptId?: string,
): PeakRefusal | undefined {
  if (
    ask.originBranchId !== undefined &&
    (ask.branchIds.length !== 1 || ask.branchIds[0] !== ask.originBranchId)
  ) {
    return 'alcance-de-sucursal';
  }

  const others = list.filter((one) => one.id !== exceptId);

  if (pointsPending(others) > 0) {
    return 'puntos-pendientes';
  }

  if (heldPeak(others)) {
    return 'ya-tiene-hora-pico';
  }

  if (peakWith(others, ask.companyId)) {
    return 'empresa-repetida';
  }

  return undefined;
}

export function canTakePeak(list: readonly RiderAgreement[], ask: PeakAsk): boolean {
  return peakRefusal(list, ask) === undefined;
}
