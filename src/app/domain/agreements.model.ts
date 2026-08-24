export type AgreementSide = 'empresa' | 'rider';

export type WorkMode = 'agente-libre' | 'normal' | 'hora-pico';

export type RecruitmentKind = Exclude<WorkMode, 'agente-libre'>;

export type AgreementState =
  'pendiente' | 'activo' | 'cumplido' | 'rechazado' | 'terminado' | 'vencido';

export type PeakRefusal =
  | 'alcance-de-sucursal'
  | 'reputacion-baja'
  | 'carreras-pendientes'
  | 'ya-tiene-hora-pico'
  | 'empresa-repetida';

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
  readonly runs: number;
  readonly runsLeft: number;
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
  readonly runs: number;
  readonly message?: string;
  readonly riderPct?: number;
  readonly proposerPct?: number;
  readonly floorPct?: number;
}

const KIND_LABELS: Record<RecruitmentKind, string> = {
  normal: 'Reclutamiento normal',
  'hora-pico': 'Reclutamiento de hora pico',
};

const WORK_MODE_LABELS: Record<WorkMode, string> = {
  'agente-libre': 'Agente libre',
  normal: 'Reclutamiento normal',
  'hora-pico': 'Reclutamiento de hora pico',
};

export const PEAK_REASONS: Record<PeakRefusal, string> = {
  'reputacion-baja':
    'Su reputación está por debajo del piso que fija Touno, así que no puede tomar hora pico ahora.',
  'carreras-pendientes': 'Todavía le quedan carreras por cumplir en otro reclutamiento.',
  'ya-tiene-hora-pico': 'Ya tiene un reclutamiento de hora pico, y sólo puede tener uno.',
  'empresa-repetida': 'Esta empresa ya lo reclutó en hora pico una vez, y no puede repetir.',
  'alcance-de-sucursal': 'Una sucursal sólo puede reclutar para sí misma, sea cual sea la clase.',
};

export function otherSide(side: AgreementSide): AgreementSide {
  return side === 'empresa' ? 'rider' : 'empresa';
}

export function kindLabel(kind: RecruitmentKind): string {
  return KIND_LABELS[kind];
}

export function workModeLabel(mode: WorkMode): string {
  return WORK_MODE_LABELS[mode];
}

export function owes(agreement: RiderAgreement): boolean {
  return agreement.state === 'activo' && agreement.runsLeft > 0;
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

export function runsPending(list: readonly RiderAgreement[]): number {
  return list.filter(owes).reduce((sum, one) => sum + one.runsLeft, 0);
}

export interface PeakAsk {
  readonly companyId: string;
  readonly branchIds: readonly string[];
  readonly originBranchId?: string;
  readonly riderPct?: number;
  readonly floorPct?: number;
}

export function scopeRefusal(ask: PeakAsk): PeakRefusal | undefined {
  if (
    ask.originBranchId !== undefined &&
    (ask.branchIds.length !== 1 || ask.branchIds[0] !== ask.originBranchId)
  ) {
    return 'alcance-de-sucursal';
  }

  return undefined;
}

export function peakRefusal(
  list: readonly RiderAgreement[],
  ask: PeakAsk,
  exceptId?: string,
): PeakRefusal | undefined {
  const scope = scopeRefusal(ask);

  if (scope) {
    return scope;
  }

  if (ask.riderPct !== undefined && ask.floorPct !== undefined && ask.riderPct < ask.floorPct) {
    return 'reputacion-baja';
  }

  const others = list.filter((one) => one.id !== exceptId);

  if (runsPending(others) > 0) {
    return 'carreras-pendientes';
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
