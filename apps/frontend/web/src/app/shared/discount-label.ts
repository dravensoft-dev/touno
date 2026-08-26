import { bs, porcentaje } from '../domain/format';
import { BuyerDiscount } from '../domain/promotions.model';

export const RIDER_ONLY_LABEL = 'No descuenta al comprador';

export function discountLabel(discount: BuyerDiscount | undefined): string {
  if (!discount) {
    return RIDER_ONLY_LABEL;
  }

  if (discount.kind === 'amount') {
    return `${bs(discount.value)} de los productos`;
  }

  const where = discount.kind === 'percent' ? 'de los productos' : 'del envío';
  const cap = discount.capBob === undefined ? '' : `, hasta ${bs(discount.capBob)}`;

  return `${porcentaje(discount.value)} ${where}${cap}`;
}
