import { ArenaKeyValueRow } from '@dravensoft/arena-angular';
import { bs } from '../domain/format';
import { Fare } from '../domain/pricing';

export const PRODUCTS_TERM = 'Productos';
export const COMMISSION_TERM = 'Comisión de Touno';
export const DISTANCE_TERM = 'Envío por distancia';
export const WEATHER_TERM = 'Recargo por clima';
export const DISCOUNT_TERM = 'Descuento';
export const TOTAL_TERM = 'Total';

export function fareRows(fare: Fare): readonly ArenaKeyValueRow[] {
  const rows: ArenaKeyValueRow[] = [
    { term: PRODUCTS_TERM, value: bs(fare.productsBob), numeric: true },
    { term: COMMISSION_TERM, value: bs(fare.commissionBob), numeric: true },
    { term: DISTANCE_TERM, value: bs(fare.distanceBob), numeric: true },
  ];

  if (fare.weatherBob > 0) {
    rows.push({ term: WEATHER_TERM, value: bs(fare.weatherBob), numeric: true });
  }

  if (fare.discountBob > 0) {
    rows.push({ term: DISCOUNT_TERM, value: `-${bs(fare.discountBob)}`, numeric: true });
  }

  return rows;
}

export function fareTotalRow(fare: Fare): ArenaKeyValueRow {
  return { term: TOTAL_TERM, value: bs(fare.totalBob), numeric: true };
}
