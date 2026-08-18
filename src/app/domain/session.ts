import { Injectable, computed, signal } from '@angular/core';

export type Role = 'comprador' | 'restaurante' | 'importadora' | 'conductor';

export interface Profile {
  readonly role: Role;
  readonly label: string;
  readonly name: string;
  readonly place: string;
  readonly icon: string;
  readonly home: string;
  readonly slug: string;
}

export const PROFILES: readonly Profile[] = [
  {
    role: 'comprador',
    label: 'Comprador',
    name: 'Rosa Villca',
    place: 'Santa Cruz',
    icon: 'ph-bold ph-user-circle',
    home: '/feed',
    slug: 'rosa-villca',
  },
  {
    role: 'restaurante',
    label: 'Dueño de restaurante',
    name: 'Pollos Copacabana',
    place: 'La Paz · Miraflores',
    icon: 'ph-bold ph-storefront',
    home: '/restaurante/pedidos',
    slug: 'pollos-copacabana',
  },
  {
    role: 'importadora',
    label: 'Dueño de importadora',
    name: 'Importadora Ale',
    place: 'La Paz · El Alto',
    icon: 'ph-bold ph-package',
    home: '/importadora/envios',
    slug: 'importadora-ale',
  },
  {
    role: 'conductor',
    label: 'Conductor',
    name: 'Marco Quispe',
    place: '3421 KZP',
    icon: 'ph-bold ph-steering-wheel',
    home: '/conductor/turno',
    slug: 'marco-quispe',
  },
];

@Injectable({ providedIn: 'root' })
export class Session {
  private readonly current = signal<Role | null>(null);

  readonly role = this.current.asReadonly();

  readonly profile = computed(() => PROFILES.find((entry) => entry.role === this.current()));

  readonly profiles = PROFILES;

  is(role: Role): boolean {
    return this.current() === role;
  }

  enter(role: Role): void {
    this.current.set(role);
  }

  leave(): void {
    this.current.set(null);
  }
}
