import { Injectable, signal } from '@angular/core';
import { City, CityWeather, Zone } from './geography.model';
import { CITIES } from './geography.data';

@Injectable({ providedIn: 'root' })
export class Geography {
  private readonly cities = signal<readonly City[]>(CITIES);

  readonly all = this.cities.asReadonly();

  byId(id: string): City | undefined {
    return this.all().find((one) => one.id === id);
  }

  bySlug(slug: string): City | undefined {
    return this.all().find((one) => one.slug === slug);
  }

  nameOf(id: string): string {
    return this.byId(id)?.name ?? '';
  }

  zonesOf(cityId: string): readonly Zone[] {
    return this.byId(cityId)?.zones ?? [];
  }

  zoneOf(cityId: string, name: string): Zone | undefined {
    return this.zonesOf(cityId).find((one) => one.name === name);
  }

  weatherOf(cityId: string): CityWeather {
    return this.byId(cityId)?.weather ?? 'normal';
  }

  isAdverse(cityId: string): boolean {
    return this.weatherOf(cityId) === 'adverso';
  }

  setWeather(cityId: string, weather: CityWeather): void {
    this.cities.update((list) =>
      list.map((one) => (one.id === cityId ? { ...one, weather } : one)),
    );
  }
}
