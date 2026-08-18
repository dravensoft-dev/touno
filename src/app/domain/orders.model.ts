import { Vertical } from './marketplace.model';

export type OrderState =
  'nuevo' | 'aceptado' | 'preparando' | 'listo' | 'en-camino' | 'entregado' | 'rechazado';

export interface Contact {
  readonly name: string;
  readonly phone: string;
  readonly ci?: string;
}

export interface OrderLine {
  readonly productId: string;
  readonly name: string;
  readonly qty: number;
  readonly unitBob: number;
  readonly options: readonly string[];
}

export interface Review {
  readonly stars: 1 | 2 | 3 | 4 | 5;
  readonly text: string;
  readonly at: string;
  readonly reply?: string;
}

export interface Order {
  readonly code: string;
  readonly slug: string;
  readonly vertical: Vertical;
  readonly merchantSlug: string;
  readonly buyer: Contact;
  readonly address: string;
  readonly lines: readonly OrderLine[];
  readonly subtotalBob: number;
  readonly deliveryBob: number;
  readonly totalBob: number;
  readonly state: OrderState;
  readonly placedAt: string;
  readonly promisedAt: string;
  readonly driverId?: string;
  readonly shipmentGuia?: string;
  readonly review?: Review;
}

export interface Coupon {
  readonly code: string;
  readonly merchantSlug: string;
  readonly label: string;
  readonly discountBob: number;
  readonly uses: number;
  readonly limit: number;
  readonly active: boolean;
  readonly until: string;
}

export interface Settlement {
  readonly id: string;
  readonly merchantSlug: string;
  readonly period: string;
  readonly orders: number;
  readonly grossBob: number;
  readonly commissionBob: number;
  readonly netBob: number;
  readonly paidAt?: string;
}
