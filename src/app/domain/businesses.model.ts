import { GeoPoint } from './geography.model';
import { Card } from './payments.model';

export type BusinessType = 'restaurante' | 'importadora';

export interface Company {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly type: BusinessType;
  readonly summary: string;
  readonly rating: number;
  readonly reviewCount: number;
  readonly categories: readonly string[];
  readonly tags: readonly string[];
  readonly since: string;
  readonly cover?: string;
  readonly weatherFeeBob?: number;
  readonly card?: Card;
}

export interface BranchHours {
  readonly days: string;
  readonly opens: string;
  readonly closes: string;
}

export interface Branch {
  readonly id: string;
  readonly slug: string;
  readonly companyId: string;
  readonly name: string;
  readonly cityId: string;
  readonly zone: string;
  readonly address: string;
  readonly phone: string;
  readonly point: GeoPoint;
  readonly hours: readonly BranchHours[];
  readonly open: boolean;
  readonly prepMinutes: number;
  readonly deliveryBob: number;
  readonly card?: Card;
  readonly managerName: string;
  readonly cover?: string;
}

export function pathOfType(type: BusinessType): string {
  return type === 'restaurante' ? 'restaurantes' : 'tiendas';
}
