export type PayoutMethod = 'automatico' | 'tarjeta';

export interface Card {
  readonly brand: string;
  readonly last4: string;
  readonly holder: string;
  readonly expires: string;
}

export interface CardDraft {
  readonly brand: string;
  readonly last4: string;
  readonly holder: string;
  readonly expires: string;
}

const METHOD_LABELS: Record<PayoutMethod, string> = {
  automatico: 'Depósito automático',
  tarjeta: 'A mi tarjeta',
};

export function methodLabel(method: PayoutMethod): string {
  return METHOD_LABELS[method];
}

export function cardLabel(card: Card): string {
  return `${card.brand} ···· ${card.last4}`;
}

export function completeCard(draft: CardDraft): boolean {
  return (
    draft.brand.trim() !== '' &&
    /^\d{4}$/.test(draft.last4.trim()) &&
    draft.holder.trim() !== '' &&
    /^\d{2}\/\d{2}$/.test(draft.expires.trim())
  );
}

export function payoutRouteOf(
  method: PayoutMethod,
  own: Card | undefined,
  payer: Card | undefined,
): PayoutMethod {
  return method === 'tarjeta' && own !== undefined && payer !== undefined
    ? 'tarjeta'
    : 'automatico';
}
