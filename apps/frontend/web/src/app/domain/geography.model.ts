export interface GeoPoint {
  readonly x: number;
  readonly y: number;
}

export type CityWeather = 'normal' | 'adverso';

export interface Zone {
  readonly name: string;
  readonly point: GeoPoint;
}

export interface City {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly zones: readonly Zone[];
  readonly point: GeoPoint;
  readonly weather: CityWeather;
}

const WEATHER_LABELS: Record<CityWeather, string> = {
  normal: 'Clima normal',
  adverso: 'Clima desfavorable',
};

export function weatherLabel(weather: CityWeather): string {
  return WEATHER_LABELS[weather];
}
