import { Injectable, computed, inject, signal } from '@angular/core';
import { NOW } from './clock';
import { Businesses } from './businesses';
import { Geography } from './geography';
import { Loads } from './loads';
import { Riders } from './riders';
import { timelineOf } from './timeline';
import { COUPONS, ORDERS, SETTLEMENTS } from './orders.data';
import {
  Assignment,
  AssignmentLeg,
  Coupon,
  Order,
  OrderSheet,
  OrderSheetParty,
  OrderState,
  OrderTimeline,
  Review,
  Settlement,
  isInterurban,
} from './orders.model';

const LIVE: readonly OrderState[] = [
  'nuevo',
  'aceptado',
  'preparando',
  'esperando-rider',
  'en-camino',
  'esperando-carga',
  'en-ruta-interurbana',
  'en-sucursal-destino',
  'listo-para-recojo',
  'reparto-local',
];

@Injectable({ providedIn: 'root' })
export class Orders {
  private readonly businesses = inject(Businesses);
  private readonly geography = inject(Geography);
  private readonly riders = inject(Riders);
  private readonly loads = inject(Loads);

  private readonly orderList = signal<readonly Order[]>(ORDERS);
  private readonly couponList = signal<readonly Coupon[]>(COUPONS);

  readonly all = this.orderList.asReadonly();

  readonly coupons = this.couponList.asReadonly();

  readonly settlements: readonly Settlement[] = SETTLEMENTS;

  readonly live = computed(() => this.all().filter((one) => LIVE.includes(one.state)));

  byCode(code: string): Order | undefined {
    return this.all().find((one) => one.code === code);
  }

  bySlug(slug: string): Order | undefined {
    return this.all().find((one) => one.slug === slug);
  }

  ofBuyer(phone: string): readonly Order[] {
    return this.all().filter((one) => one.buyer.phone === phone);
  }

  ofBranch(branchId: string): readonly Order[] {
    return this.all().filter(
      (one) => one.originBranchId === branchId || one.destinationBranchId === branchId,
    );
  }

  ofCompany(companyId: string): readonly Order[] {
    return this.all().filter((one) => one.companyId === companyId);
  }

  ofRider(riderId: string): readonly Order[] {
    return this.all().filter((one) => one.assignments.some((two) => two.riderId === riderId));
  }

  liveOfBranch(branchId: string): readonly Order[] {
    return this.ofBranch(branchId).filter((one) => LIVE.includes(one.state));
  }

  inState(orders: readonly Order[], state: OrderState): readonly Order[] {
    return orders.filter((one) => one.state === state);
  }

  awaitingRider(branchId: string): readonly Order[] {
    return this.ofBranch(branchId).filter(
      (one) => one.state === 'esperando-rider' || one.state === 'en-sucursal-destino',
    );
  }

  toCollect(branchId: string): readonly Order[] {
    return this.all().filter(
      (one) => one.destinationBranchId === branchId && one.state === 'listo-para-recojo',
    );
  }

  legOf(order: Order, leg: AssignmentLeg): Assignment | undefined {
    return order.assignments.find((one) => one.leg === leg);
  }

  timeline(order: Order): OrderTimeline {
    return timelineOf(order, order.loadId ? this.loads.byId(order.loadId) : undefined);
  }

  sheetOf(order: Order): OrderSheet {
    const parties: OrderSheetParty[] = [];
    const origin = this.businesses.branchById(order.originBranchId);

    if (origin) {
      parties.push({
        role: 'sucursal-origen',
        title: origin.name,
        subtitle: `${origin.address} · ${this.geography.nameOf(origin.cityId)}`,
        meta: origin.phone,
        icon: 'ph-bold ph-storefront',
      });
    }

    const first = this.legOf(order, 'origen') ?? this.legOf(order, 'interurbano');

    if (first) {
      parties.push(this.riderParty('rider-origen', first, order));
    }

    const local = order.destinationBranchId
      ? this.businesses.branchById(order.destinationBranchId)
      : undefined;

    if (local) {
      parties.push({
        role: 'sucursal-local',
        title: local.name,
        subtitle: `${local.address} · ${this.geography.nameOf(local.cityId)}`,
        meta: local.phone,
        icon: 'ph-bold ph-buildings',
      });
    }

    const lastLeg = this.legOf(order, 'local');

    if (lastLeg) {
      parties.push(this.riderParty('rider-local', lastLeg, order));
    }

    return { code: order.code, scenario: order.scenario, parties };
  }

  reviewsOf(companyId: string): readonly Review[] {
    return this.ofCompany(companyId)
      .map((one) => one.review)
      .filter((one): one is Review => one !== undefined);
  }

  couponsOf(companyId: string): readonly Coupon[] {
    return this.coupons().filter((one) => one.companyId === companyId);
  }

  settlementsOf(companyId: string): readonly Settlement[] {
    return this.settlements.filter((one) => one.companyId === companyId);
  }

  salesOf(branchId: string): number {
    return this.ofBranch(branchId)
      .filter((one) => one.state !== 'rechazado')
      .reduce((sum, one) => sum + one.totalBob, 0);
  }

  advance(slug: string, state: OrderState): void {
    this.orderList.update((list) =>
      list.map((one) => (one.slug === slug ? { ...one, state } : one)),
    );
  }

  assign(slug: string, leg: AssignmentLeg, riderId: string, branchId: string): void {
    this.orderList.update((list) =>
      list.map((one) =>
        one.slug === slug
          ? {
              ...one,
              assignments: [
                ...one.assignments.filter((two) => two.leg !== leg),
                { leg, riderId, branchId, assignedAt: NOW },
              ],
              state: leg === 'local' ? 'reparto-local' : 'en-camino',
              custody: { kind: 'rider', riderId, since: NOW },
            }
          : one,
      ),
    );
  }

  scan(slug: string, by: string): void {
    this.orderList.update((list) =>
      list.map((one) =>
        one.slug === slug ? { ...one, state: 'entregado', scannedAt: NOW, scannedBy: by } : one,
      ),
    );
  }

  toggleCoupon(code: string): void {
    this.couponList.update((list) =>
      list.map((one) => (one.code === code ? { ...one, active: !one.active } : one)),
    );
  }

  private riderParty(
    role: 'rider-origen' | 'rider-local',
    assignment: Assignment,
    order: Order,
  ): OrderSheetParty {
    const rider = this.riders.byId(assignment.riderId);
    const city = this.businesses.cityOf(assignment.branchId);
    const long = assignment.leg === 'interurbano';

    return {
      role,
      title: rider?.name ?? 'Rider por asignar',
      subtitle: long
        ? `Tramo interurbano · ${rider?.plate ?? ''}`
        : `${this.geography.nameOf(city)} · ${rider?.plate ?? ''}`,
      meta: isInterurban(order.scenario) && !long ? 'Entrega final' : undefined,
      icon: long ? 'ph-bold ph-truck' : 'ph-bold ph-motorcycle',
    };
  }
}
