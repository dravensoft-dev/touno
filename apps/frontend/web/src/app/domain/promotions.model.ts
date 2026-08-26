import { WorkMode } from './agreements.model';
import { NOW } from './clock';
import { DeliveryChoice } from './orders.model';

export type PromotionKind = 'amount' | 'percent' | 'delivery';

export type PromotionRefusal =
  | 'no-existe'
  | 'inactiva'
  | 'vencida'
  | 'agotada'
  | 'otra-empresa'
  | 'reputacion-baja'
  | 'sin-envio'
  | 'sin-descuento';

export const PROMOTION_REASONS: Record<PromotionRefusal, string> = {
  'no-existe': 'Ese código no existe.',
  inactiva: 'Esa promoción está apagada ahora mismo.',
  vencida: 'Esa promoción ya venció.',
  agotada: 'Esa promoción llegó a su tope de usos.',
  'otra-empresa': 'Esa promoción es de otro negocio, y en tu carrito no hay nada suyo.',
  'reputacion-baja':
    'Esa promoción pide una reputación más alta que la tuya. Sube cumpliendo, no gastando.',
  'sin-envio': 'Esa promoción descuenta el envío, y tú recoges en mostrador.',
  'sin-descuento':
    'Esa promoción no descuenta nada al comprador: es un trato entre el negocio y sus riders.',
};

export const PROMOTION_KIND_LABELS: Record<PromotionKind, string> = {
  amount: 'Monto fijo',
  percent: 'Porcentaje de los productos',
  delivery: 'Porcentaje del envío',
};

export interface RiderLeg {
  readonly mode: WorkMode;
  readonly perTripBob: number;
  readonly bonusAfterRuns: number;
  readonly bonusBob: number;
  readonly guaranteedBob: number;
}

export interface BuyerDiscount {
  readonly kind: PromotionKind;
  readonly value: number;
  readonly capBob?: number;
  readonly minReputationPct?: number;
}

export interface Promotion {
  readonly code: string;
  readonly companyId: string;
  readonly label: string;
  readonly uses: number;
  readonly limit: number;
  readonly active: boolean;
  readonly until: string;
  readonly discount?: BuyerDiscount;
  readonly riderLeg?: RiderLeg;
}

export interface PromotionDraft {
  readonly companyId: string;
  readonly code: string;
  readonly label: string;
  readonly limit: number;
  readonly until: string;
  readonly discount?: BuyerDiscount;
  readonly riderLeg?: RiderLeg;
}

export interface PromotionAsk {
  readonly companyIds: readonly string[];
  readonly delivery: DeliveryChoice;
  readonly buyerPct?: number;
}

export function today(): string {
  return NOW.slice(0, 10);
}

export function expired(promotion: Promotion): boolean {
  return promotion.until < today();
}

export function exhausted(promotion: Promotion): boolean {
  return promotion.uses >= promotion.limit;
}

export function usesLeft(promotion: Promotion): number {
  return Math.max(promotion.limit - promotion.uses, 0);
}

export function live(promotion: Promotion): boolean {
  return promotion.active && !expired(promotion) && !exhausted(promotion);
}

export function promotionRefusal(
  promotion: Promotion | undefined,
  ask: PromotionAsk,
): PromotionRefusal | undefined {
  if (!promotion) {
    return 'no-existe';
  }

  if (!promotion.active) {
    return 'inactiva';
  }

  if (expired(promotion)) {
    return 'vencida';
  }

  if (exhausted(promotion)) {
    return 'agotada';
  }

  if (!ask.companyIds.includes(promotion.companyId)) {
    return 'otra-empresa';
  }

  const discount = promotion.discount;

  if (!discount) {
    return 'sin-descuento';
  }

  if (discount.kind === 'delivery' && ask.delivery !== 'domicilio') {
    return 'sin-envio';
  }

  if (
    discount.minReputationPct !== undefined &&
    ask.buyerPct !== undefined &&
    ask.buyerPct < discount.minReputationPct
  ) {
    return 'reputacion-baja';
  }

  return undefined;
}
