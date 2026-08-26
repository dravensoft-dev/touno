import { WorkMode } from './agreements.model';

export interface PlatformConfig {
  readonly commissionPct: number;
  readonly minDeliveryFeeBob: number;
  readonly cityRateBob: number;
  readonly interurbanRateBob: number;
  readonly weatherFeeBob: number;
  readonly minRuns: number;
  readonly minReputationPct: number;
  readonly riderBaseBob: Record<WorkMode, number>;
}

export function atLeast(value: number, floor: number): number {
  return Math.max(value, floor);
}

export function orderedBases(bases: Record<WorkMode, number>): boolean {
  return bases['agente-libre'] < bases.normal && bases.normal < bases['hora-pico'];
}
