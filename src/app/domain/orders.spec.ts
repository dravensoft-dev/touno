import { TestBed } from '@angular/core/testing';
import { Agreements } from './agreements';
import { Businesses } from './businesses';
import { Catalog } from './catalog';
import { Chat } from './chat';
import { Geography } from './geography';
import { Loads } from './loads';
import { Platform } from './platform';
import { fareOf, round2, unitsBetween } from './pricing';
import { Orders } from './orders';
import { Riders } from './riders';
import { Order, OrderScenario, isInterurban, movingLeg } from './orders.model';
import { rangeOf } from './riders.model';

describe('Orders', () => {
  let orders: Orders;
  let businesses: Businesses;
  let catalog: Catalog;
  let riders: Riders;
  let agreements: Agreements;
  let loads: Loads;
  let chat: Chat;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    orders = TestBed.inject(Orders);
    businesses = TestBed.inject(Businesses);
    catalog = TestBed.inject(Catalog);
    riders = TestBed.inject(Riders);
    agreements = TestBed.inject(Agreements);
    loads = TestBed.inject(Loads);
    chat = TestBed.inject(Chat);
  });

  function interurban(): readonly Order[] {
    return orders.all().filter((one) => isInterurban(one.scenario));
  }

  it('keeps a code unique and its slug the lowercase form', () => {
    const codes = orders.all().map((one) => one.code);

    expect(codes.length).toBeGreaterThan(0);
    expect(new Set(codes).size).toBe(codes.length);

    for (const order of orders.all()) {
      expect(order.slug).toBe(order.code.toLowerCase());
      expect(orders.bySlug(order.slug)?.code).toBe(order.code);
    }
  });

  it('reaches all four scenarios, so every timeline is drawable', () => {
    const seen = new Set(orders.all().map((one) => one.scenario));

    for (const scenario of [
      'restaurante',
      'importadora-local',
      'interurbano-domicilio',
      'interurbano-sucursal',
    ] as OrderScenario[]) {
      expect(seen.has(scenario)).toBe(true);
    }
  });

  it('adds up to the total it charges, over lines that exist', () => {
    for (const order of orders.all()) {
      const lines = order.lines.reduce((sum, one) => sum + one.qty * one.unitBob, 0);

      expect(order.lines.length).toBeGreaterThan(0);
      expect(order.subtotalBob).toBe(lines);
      expect(order.totalBob).toBe(
        round2(order.subtotalBob + order.commissionBob + order.distanceBob + order.weatherBob),
      );

      for (const line of order.lines) {
        expect(catalog.byId(line.productId)?.companyId).toBe(order.companyId);
      }
    }
  });

  it('recomputes every stored fare from the order own inputs and gets the same figures', () => {
    const geography = TestBed.inject(Geography);
    const platform = TestBed.inject(Platform);

    for (const order of orders.all()) {
      const handoverId = isInterurban(order.scenario)
        ? (order.destinationBranchId ?? order.originBranchId)
        : order.originBranchId;
      const handover = businesses.branchById(handoverId);
      const origin = businesses.branchById(order.originBranchId);
      const from = geography.byId(origin?.cityId ?? '');
      const to = geography.byId(order.buyerCityId);
      const zone = order.zoneName ? geography.zoneOf(order.buyerCityId, order.zoneName) : undefined;

      expect(handover).toBeDefined();
      expect(to).toBeDefined();

      const fare = fareOf({
        productsBob: order.subtotalBob,
        delivery: order.delivery,
        baseFeeBob: handover?.deliveryBob ?? 0,
        cityUnits: zone && handover ? unitsBetween(handover.point, zone.point) : 0,
        interurbanUnits: from && to && from.id !== to.id ? unitsBetween(from.point, to.point) : 0,
        adverseWeather: geography.isAdverse(order.buyerCityId),
        weatherFeeBob: businesses.weatherFeeOf(order.companyId),
        config: platform.config(),
      });

      expect(fare.commissionBob).toBe(order.commissionBob);
      expect(fare.distanceBob).toBe(order.distanceBob);
      expect(fare.weatherBob).toBe(order.weatherBob);
      expect(fare.totalBob).toBe(order.totalBob);
    }
  });

  it('charges no distance and no weather to a buyer who collects at a counter', () => {
    for (const order of orders.all().filter((one) => one.delivery === 'sucursal')) {
      expect(order.distanceBob).toBe(0);
      expect(order.weatherBob).toBe(0);
    }
  });

  it('names a zone of the buyer own city on every order that goes to a door', () => {
    const geography = TestBed.inject(Geography);

    for (const order of orders.all().filter((one) => one.delivery === 'domicilio')) {
      expect(order.zoneName).toBeDefined();
      expect(geography.zoneOf(order.buyerCityId, order.zoneName ?? '')).toBeDefined();
    }
  });

  it('sits a restaurant order in the same city as its sucursal, which is the guide rule', () => {
    for (const order of orders.all().filter((one) => !isInterurban(one.scenario))) {
      expect(businesses.cityOf(order.originBranchId)).toBe(order.buyerCityId);
      expect(order.destinationBranchId).toBeUndefined();
    }
  });

  it('needs a sucursal in the buyer city before it will sell across cities', () => {
    expect(interurban().length).toBeGreaterThan(0);

    for (const order of interurban()) {
      expect(businesses.hasBranchIn(order.companyId, order.buyerCityId)).toBe(true);
      expect(businesses.cityOf(order.destinationBranchId ?? '')).toBe(order.buyerCityId);
      expect(businesses.cityOf(order.originBranchId)).not.toBe(order.buyerCityId);
      expect(businesses.branchById(order.originBranchId)?.companyId).toBe(order.companyId);
      expect(businesses.branchById(order.destinationBranchId ?? '')?.companyId).toBe(
        order.companyId,
      );
    }
  });

  it('asks for an address only when something is coming to the door', () => {
    for (const order of orders.all()) {
      if (order.delivery === 'sucursal') {
        expect(order.address).toBeUndefined();
        expect(order.scenario).toBe('interurbano-sucursal');
      } else {
        expect(order.address).toBeDefined();
      }
    }
  });

  it('carries both interurban endings, so the buyer choice is reachable', () => {
    expect(interurban().some((one) => one.delivery === 'domicilio')).toBe(true);
    expect(interurban().some((one) => one.delivery === 'sucursal')).toBe(true);
  });

  it('puts a truck on the interurban leg and a moto on the local one', () => {
    for (const order of orders.all()) {
      for (const assignment of order.assignments) {
        const rider = riders.byId(assignment.riderId);

        expect(rider).toBeDefined();
        expect(rangeOf(rider?.vehicle ?? 'moto')).toBe(
          assignment.leg === 'interurbano' ? 'interurbano' : 'urbano',
        );
      }
    }
  });

  it('assigns a rider only to a sucursal an agreement covers, on the leg being moved now', () => {
    const moving = orders
      .all()
      .map((one) => ({ order: one, leg: movingLeg(one.state) }))
      .filter((one) => one.leg !== undefined);

    expect(moving.length).toBeGreaterThan(0);

    for (const { order, leg } of moving) {
      const assignment = orders.legOf(order, leg!);

      expect(assignment).toBeDefined();
      expect(agreements.covers(assignment!.riderId, assignment!.branchId)).toBe(true);
    }
  });

  it('lets a finished leg outlive the agreement that authorised it', () => {
    for (const order of orders.all()) {
      for (const assignment of order.assignments) {
        if (assignment.leg === movingLeg(order.state)) {
          continue;
        }

        const held = agreements
          .ofRider(assignment.riderId)
          .filter((one) => one.state !== 'pendiente' && one.state !== 'rechazado');

        expect(held.some((one) => one.branchIds.includes(assignment.branchId))).toBe(true);
      }
    }
  });

  it('hands custody to whoever is holding it, and to nobody else', () => {
    for (const order of orders.all()) {
      if (order.custody.kind === 'rider') {
        expect(riders.byId(order.custody.riderId ?? '')).toBeDefined();
        expect(order.assignments.some((one) => one.riderId === order.custody.riderId)).toBe(true);
      } else {
        expect(businesses.branchById(order.custody.branchId ?? '')).toBeDefined();
      }
    }
  });

  it('gives every order exactly one chat thread, pointed at the same custodian', () => {
    for (const order of orders.all()) {
      const thread = chat.byId(order.threadId);

      expect(thread?.orderCode).toBe(order.code);
      expect(thread?.counterpart.kind).toBe(order.custody.kind);
      expect(thread?.counterpart.riderId).toBe(order.custody.riderId);
      expect(thread?.counterpart.branchId).toBe(order.custody.branchId);
    }

    expect(chat.all().length).toBe(orders.all().length);
  });

  it('rides in a load that names it back, and only when it crosses cities', () => {
    for (const order of orders.all()) {
      if (order.loadId) {
        const load = loads.byId(order.loadId);

        expect(isInterurban(order.scenario)).toBe(true);
        expect(load?.orderCodes).toContain(order.code);
        expect(load?.fromBranchId).toBe(order.originBranchId);
        expect(load?.toBranchId).toBe(order.destinationBranchId);
      }
    }
  });

  it('records who read the code, and records it only once delivered', () => {
    const delivered = orders.all().filter((one) => one.state === 'entregado');

    expect(delivered.length).toBeGreaterThan(0);

    for (const order of orders.all()) {
      if (order.state === 'entregado') {
        expect(order.scannedAt).toBeDefined();
        expect(
          riders.byId(order.scannedBy ?? '') ?? businesses.branchById(order.scannedBy ?? ''),
        ).toBeDefined();
      } else {
        expect(order.scannedAt).toBeUndefined();
      }
    }
  });

  it('is scanned by a rider at a door and by a sucursal at a counter', () => {
    const byRider = orders
      .all()
      .filter((one) => one.scannedBy && riders.byId(one.scannedBy) !== undefined);
    const byBranch = orders
      .all()
      .filter((one) => one.scannedBy && businesses.branchById(one.scannedBy) !== undefined);

    expect(byRider.length).toBeGreaterThan(0);
    expect(byBranch.length).toBeGreaterThan(0);
    expect(byBranch.every((one) => one.delivery === 'sucursal')).toBe(true);
  });

  it('finds a buyer own orders by the phone that placed them', () => {
    const mine = orders.ofBuyer('7712 4408');

    expect(mine.length).toBeGreaterThan(1);
    expect(mine.every((one) => one.buyer.name === 'Rosa Villca')).toBe(true);
  });

  it('lists what a sucursal has to act on, from either end of the trip', () => {
    expect(orders.ofBranch('b-ale-la-paz').map((one) => one.code)).toContain('TO-2203');
    expect(orders.ofBranch('b-ale-la-paz').map((one) => one.code)).toContain('TO-2205');
    expect(orders.toCollect('b-andes-la-paz').map((one) => one.code)).toEqual(['TO-2206']);
  });

  it('assigns a rider, takes custody with him, and then closes on the scan', () => {
    orders.assign('to-1042', 'origen', 'r-marco', 'b-copacabana-sopocachi');

    const assigned = orders.bySlug('to-1042');

    expect(assigned?.state).toBe('en-camino');
    expect(assigned?.custody.kind).toBe('rider');
    expect(assigned?.custody.riderId).toBe('r-marco');

    orders.scan('to-1042', 'r-marco');

    expect(orders.bySlug('to-1042')?.state).toBe('entregado');
    expect(orders.bySlug('to-1042')?.scannedBy).toBe('r-marco');
  });

  it('replaces a leg rather than stacking two riders on it', () => {
    orders.assign('to-2205', 'local', 'r-hugo', 'b-ale-la-paz');

    const legs = orders.bySlug('to-2205')?.assignments.filter((one) => one.leg === 'local') ?? [];

    expect(legs.length).toBe(1);
    expect(legs[0].riderId).toBe('r-hugo');
  });

  it('refuses to put work on a rider that sucursal is not bound to at all', () => {
    expect(() => orders.assign('to-2205', 'local', 'r-diego', 'b-ale-la-paz')).toThrow();
  });

  it('records how the rider was working when the leg was handed to him', () => {
    orders.assign('to-2205', 'local', 'r-hugo', 'b-ale-la-paz');

    const leg = orders.bySlug('to-2205')?.assignments.find((one) => one.leg === 'local');

    expect(leg?.mode).toBe('normal');
  });

  it('spends a career point when the rider scans at the door, and none at the counter', () => {
    const door = orders.all().find((one) => movingLeg(one.state) !== undefined);
    const leg = door ? movingLeg(door.state) : undefined;
    const assignment = door && leg ? orders.legOf(door, leg) : undefined;

    expect(assignment).toBeDefined();

    const before = agreements.chargeable(
      assignment?.riderId ?? '',
      assignment?.branchId ?? '',
    )?.runsLeft;

    expect(before).toBeGreaterThan(0);
    expect(orders.scan(door?.slug ?? '', assignment?.riderId ?? '')?.runsLeft).toBe(
      (before ?? 0) - 1,
    );

    const counter = orders.all().find((one) => one.state === 'listo-para-recojo');

    expect(orders.scan(counter?.slug ?? '', counter?.destinationBranchId ?? '')).toBeUndefined();
  });

  it('counts what a sucursal sold, not what the buyer paid on top of it', () => {
    const branchId = 'b-copacabana-miraflores';
    const mine = orders
      .all()
      .filter((one) => one.originBranchId === branchId && one.state !== 'rechazado');

    expect(mine.length).toBeGreaterThan(0);
    expect(orders.salesOf(branchId)).toBe(mine.reduce((sum, one) => sum + one.subtotalBob, 0));
    expect(orders.salesOf(branchId)).toBeLessThan(mine.reduce((sum, one) => sum + one.totalBob, 0));
  });
});
