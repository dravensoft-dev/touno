import { GeoPoint } from './geography.model';
import { Card } from './payments.model';

export type BusinessType = 'restaurante' | 'importadora';

export type CompanyPlan = 'basico' | 'plus' | 'marca';

export interface PlanLimits {
  readonly label: string;
  readonly feeBob: number;
  readonly activePromotions: number;
  readonly featuredSlots: number;
  readonly homeFeatured: boolean;
  readonly riderLegs: boolean;
}

export const PLAN_LIMITS: Record<CompanyPlan, PlanLimits> = {
  basico: {
    label: 'Básico',
    feeBob: 0,
    activePromotions: 1,
    featuredSlots: 0,
    homeFeatured: false,
    riderLegs: false,
  },
  plus: {
    label: 'Plus',
    feeBob: 149,
    activePromotions: 5,
    featuredSlots: 1,
    homeFeatured: false,
    riderLegs: false,
  },
  marca: {
    label: 'Marca',
    feeBob: 399,
    activePromotions: Number.POSITIVE_INFINITY,
    featuredSlots: 3,
    homeFeatured: true,
    riderLegs: true,
  },
};

export function limitsOf(plan: CompanyPlan): PlanLimits {
  return PLAN_LIMITS[plan];
}

export function withoutLimit(value: number): boolean {
  return !Number.isFinite(value);
}

export interface Company {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly type: BusinessType;
  readonly summary: string;
  readonly categories: readonly string[];
  readonly tags: readonly string[];
  readonly since: string;
  readonly plan: CompanyPlan;
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
  readonly featuredUntil?: string;
  readonly card?: Card;
  readonly managerName: string;
  readonly cover?: string;
}

export function pathOfType(type: BusinessType): string {
  return type === 'restaurante' ? 'restaurantes' : 'tiendas';
}
