export type AgreementSide = 'empresa' | 'rider';

export type AgreementState = 'pendiente' | 'activo' | 'rechazado' | 'terminado' | 'vencido';

export interface RiderAgreement {
  readonly id: string;
  readonly riderId: string;
  readonly companyId: string;
  readonly branchIds: readonly string[];
  readonly initiatedBy: AgreementSide;
  readonly state: AgreementState;
  readonly perTripBob: number;
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
  readonly perTripBob: number;
  readonly message?: string;
}

export function otherSide(side: AgreementSide): AgreementSide {
  return side === 'empresa' ? 'rider' : 'empresa';
}
