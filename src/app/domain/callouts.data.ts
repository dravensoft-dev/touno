import { CupoClaim, FreeAgentCallout } from './callouts.model';

export const CALLOUTS: readonly FreeAgentCallout[] = [
  {
    id: 'lc-601',
    branchId: 'b-copacabana-miraflores',
    companyId: 'c-copacabana',
    cupos: 3,
    fixedBob: 10,
    message: 'Almuerzo de hoy. Llega y te damos pedidos hasta que quieras irte.',
    openedAt: '2026-08-15T11:40:00',
  },
  {
    id: 'lc-602',
    branchId: 'b-illimani-san-miguel',
    companyId: 'c-illimani',
    cupos: 1,
    fixedBob: 12,
    openedAt: '2026-08-15T12:05:00',
  },
  {
    id: 'lc-603',
    branchId: 'b-tecno-la-paz',
    companyId: 'c-tecno',
    cupos: 2,
    fixedBob: 11,
    message: 'Entregas de la tarde en la zona central.',
    openedAt: '2026-08-15T12:50:00',
  },
  {
    id: 'lc-604',
    branchId: 'b-ale-la-paz',
    companyId: 'c-ale',
    cupos: 2,
    fixedBob: 9,
    openedAt: '2026-08-14T10:15:00',
    closedAt: '2026-08-14T19:00:00',
  },
];

export const CUPO_CLAIMS: readonly CupoClaim[] = [
  {
    id: 'cc-701',
    calloutId: 'lc-601',
    riderId: 'r-tania',
    state: 'trabajando',
    claimedAt: '2026-08-15T11:52:00',
    arrivedAt: '2026-08-15T12:14:00',
  },
  {
    id: 'cc-702',
    calloutId: 'lc-602',
    riderId: 'r-ivan',
    state: 'en-camino',
    claimedAt: '2026-08-15T13:04:00',
  },
  {
    id: 'cc-703',
    calloutId: 'lc-604',
    riderId: 'r-tania',
    state: 'terminado',
    claimedAt: '2026-08-14T10:40:00',
    arrivedAt: '2026-08-14T11:02:00',
    leftAt: '2026-08-14T15:30:00',
  },
  {
    id: 'cc-704',
    calloutId: 'lc-604',
    riderId: 'r-rene',
    state: 'abandonado',
    claimedAt: '2026-08-14T12:10:00',
  },
];
