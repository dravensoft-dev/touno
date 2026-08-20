export interface City {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly zones: readonly string[];
}

export interface GeoPoint {
  readonly x: number;
  readonly y: number;
}
