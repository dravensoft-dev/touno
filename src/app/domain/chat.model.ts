export type ChatAuthor = 'comprador' | 'rider' | 'sucursal' | 'sistema';

export type CustodyKind = 'sucursal' | 'rider';

export interface Custody {
  readonly kind: CustodyKind;
  readonly branchId?: string;
  readonly riderId?: string;
  readonly since: string;
}

export interface ChatMessage {
  readonly id: string;
  readonly threadId: string;
  readonly author: ChatAuthor;
  readonly authorName: string;
  readonly body: string;
  readonly at: string;
}

export interface ChatThread {
  readonly id: string;
  readonly orderCode: string;
  readonly counterpart: Custody;
  readonly counterpartName: string;
  readonly messages: readonly ChatMessage[];
}

export function authorOf(kind: CustodyKind): 'rider' | 'sucursal' {
  return kind === 'rider' ? 'rider' : 'sucursal';
}
