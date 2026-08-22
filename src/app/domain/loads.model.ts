export type LoadState = 'acumulando' | 'en-ruta' | 'descargado';

export interface TruckLoad {
  readonly id: string;
  readonly riderId: string;
  readonly fromBranchId: string;
  readonly toBranchId: string;
  readonly orderCodes: readonly string[];
  readonly capacity: number;
  readonly receiptCode: string;
  readonly state: LoadState;
  readonly openedAt: string;
  readonly departsAt: string;
  readonly arrivesAt: string;
  readonly receivedAt?: string;
}
