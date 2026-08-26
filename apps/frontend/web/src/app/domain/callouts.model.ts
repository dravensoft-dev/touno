export type CalloutState = 'abierto' | 'lleno' | 'cerrado';

export type ClaimState = 'en-camino' | 'trabajando' | 'terminado' | 'abandonado';

export interface FreeAgentCallout {
  readonly id: string;
  readonly branchId: string;
  readonly companyId: string;
  readonly cupos: number;
  readonly fixedBob: number;
  readonly message?: string;
  readonly openedAt: string;
  readonly closedAt?: string;
}

export interface CalloutDraft {
  readonly branchId: string;
  readonly companyId: string;
  readonly originBranchId?: string;
  readonly cupos: number;
  readonly fixedBob: number;
  readonly message?: string;
}

export interface CupoClaim {
  readonly id: string;
  readonly calloutId: string;
  readonly riderId: string;
  readonly state: ClaimState;
  readonly claimedAt: string;
  readonly arrivedAt?: string;
  readonly leftAt?: string;
}

export function held(state: ClaimState): boolean {
  return state === 'en-camino' || state === 'trabajando';
}

export function cuposLeft(callout: FreeAgentCallout, claims: readonly CupoClaim[]): number {
  const taken = claims.filter((one) => one.calloutId === callout.id && held(one.state)).length;

  return Math.max(0, callout.cupos - taken);
}

export function stateOf(callout: FreeAgentCallout, claims: readonly CupoClaim[]): CalloutState {
  if (callout.closedAt !== undefined) {
    return 'cerrado';
  }

  return cuposLeft(callout, claims) === 0 ? 'lleno' : 'abierto';
}

export function holding(claims: readonly CupoClaim[], riderId: string): CupoClaim | undefined {
  return claims.find((one) => one.riderId === riderId && held(one.state));
}
