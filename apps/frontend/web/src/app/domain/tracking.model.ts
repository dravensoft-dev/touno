import { GeoPoint } from './geography.model';

export interface RiderPing {
  readonly at: string;
  readonly point: GeoPoint;
}

export interface RiderTrack {
  readonly orderCode: string;
  readonly riderId: string;
  readonly from: GeoPoint;
  readonly to: GeoPoint;
  readonly route: readonly GeoPoint[];
  readonly pings: readonly RiderPing[];
  readonly lastPingAt: string;
}

export type StreetRank = 'avenida' | 'calle';

export interface StreetSegment {
  readonly from: GeoPoint;
  readonly to: GeoPoint;
  readonly rank: StreetRank;
}

export interface CityMap {
  readonly cityId: string;
  readonly streets: readonly StreetSegment[];
}

export const STALE_AFTER_MINUTES = 4;
