import { Injectable, computed, signal } from '@angular/core';
import { BusinessType } from './businesses.model';

export type Role = 'comprador' | 'rider' | 'gerente-empresa' | 'gerente-sucursal';

export interface Profile {
  readonly id: string;
  readonly role: Role;
  readonly label: string;
  readonly name: string;
  readonly place: string;
  readonly icon: string;
  readonly home: string;
  readonly companyId?: string;
  readonly branchId?: string;
  readonly riderId?: string;
  readonly buyerPhone?: string;
  readonly businessType?: BusinessType;
}

export const PROFILES: readonly Profile[] = [
  {
    id: 'p-comprador',
    role: 'comprador',
    label: 'Compradora',
    name: 'Rosa Villca',
    place: 'La Paz · Obrajes',
    icon: 'ph-bold ph-user-circle',
    home: '/feed',
    buyerPhone: '7712 4408',
  },
  {
    id: 'p-rider',
    role: 'rider',
    label: 'Rider',
    name: 'Marco Quispe',
    place: 'La Paz · 3421 KZP',
    icon: 'ph-bold ph-motorcycle',
    home: '/rider/turno',
    riderId: 'r-marco',
  },
  {
    id: 'p-rider-camion',
    role: 'rider',
    label: 'Rider con camión',
    name: 'Hugo Barrientos',
    place: 'Interurbano · 1150 CMX',
    icon: 'ph-bold ph-truck',
    home: '/rider/turno',
    riderId: 'r-hugo',
  },
  {
    id: 'p-empresa-restaurante',
    role: 'gerente-empresa',
    label: 'Gerente de empresa · restaurante',
    name: 'Pollos Copacabana',
    place: 'Tres sucursales',
    icon: 'ph-bold ph-buildings',
    home: '/empresa/sucursales',
    companyId: 'c-copacabana',
    businessType: 'restaurante',
  },
  {
    id: 'p-sucursal-restaurante',
    role: 'gerente-sucursal',
    label: 'Gerente de sucursal · restaurante',
    name: 'Delia Mamani',
    place: 'Copacabana Miraflores',
    icon: 'ph-bold ph-storefront',
    home: '/sucursal/pedidos',
    companyId: 'c-copacabana',
    branchId: 'b-copacabana-miraflores',
    businessType: 'restaurante',
  },
  {
    id: 'p-empresa-importadora',
    role: 'gerente-empresa',
    label: 'Gerente de empresa · importadora',
    name: 'Importadora Ale',
    place: 'Tres ciudades',
    icon: 'ph-bold ph-buildings',
    home: '/empresa/sucursales',
    companyId: 'c-ale',
    businessType: 'importadora',
  },
  {
    id: 'p-sucursal-importadora',
    role: 'gerente-sucursal',
    label: 'Gerente de sucursal · importadora',
    name: 'Ale Quisbert',
    place: 'Ale La Paz',
    icon: 'ph-bold ph-package',
    home: '/sucursal/pedidos',
    companyId: 'c-ale',
    branchId: 'b-ale-la-paz',
    businessType: 'importadora',
  },
];

@Injectable({ providedIn: 'root' })
export class Session {
  private readonly current = signal<string | null>(null);

  readonly profiles = PROFILES;

  readonly profileId = this.current.asReadonly();

  readonly profile = computed(() => PROFILES.find((one) => one.id === this.current()));

  readonly role = computed<Role | null>(() => this.profile()?.role ?? null);

  readonly businessType = computed(() => this.profile()?.businessType);

  readonly companyId = computed(() => this.profile()?.companyId);

  readonly branchId = computed(() => this.profile()?.branchId);

  readonly riderId = computed(() => this.profile()?.riderId);

  readonly buyerPhone = computed(() => this.profile()?.buyerPhone);

  is(role: Role): boolean {
    return this.role() === role;
  }

  enter(profileId: string): void {
    this.current.set(profileId);
  }

  leave(): void {
    this.current.set(null);
  }
}

export function profilesOfRole(role: Role): readonly Profile[] {
  return PROFILES.filter((one) => one.role === role);
}
