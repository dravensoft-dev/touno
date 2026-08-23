export interface PlatformConfig {
  readonly commissionPct: number;
  readonly minDeliveryFeeBob: number;
  readonly cityRateBob: number;
  readonly interurbanRateBob: number;
  readonly weatherFeeBob: number;
  readonly minRuns: number;
  readonly minReputationPct: number;
}

export function atLeast(value: number, floor: number): number {
  return Math.max(value, floor);
}
