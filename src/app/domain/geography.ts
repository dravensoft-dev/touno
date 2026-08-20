import { Injectable, signal } from '@angular/core';
import { City } from './geography.model';
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
}
