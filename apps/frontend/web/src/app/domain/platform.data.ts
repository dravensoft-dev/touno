import { PlatformConfig } from './platform.model';

export const PLATFORM: PlatformConfig = {
  commissionPct: 15,
  minDeliveryFeeBob: 6,
  cityRateBob: 0.25,
  interurbanRateBob: 0.6,
  weatherFeeBob: 5,
  minRuns: 5,
  minReputationPct: 80,
  riderBaseBob: { 'agente-libre': 8, normal: 12, 'hora-pico': 22 },
};
