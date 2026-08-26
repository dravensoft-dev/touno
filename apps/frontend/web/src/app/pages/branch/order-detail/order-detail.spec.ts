import { APP_BASE_HREF } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Chat } from '../../../domain/chat';
import { Orders } from '../../../domain/orders';
import { Reputation } from '../../../domain/reputation';
import { Riders } from '../../../domain/riders';
import { Staffing } from '../../../domain/staffing';
import { Session } from '../../../domain/session';
import { rangeOf } from '../../../domain/riders.model';
import { BranchOrderDetail } from './order-detail';

function render(slug: string, profileId = 'p-sucursal-restaurante', waiting = false) {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [provideRouter([]), { provide: APP_BASE_HREF, useValue: '/' }],
  });

  TestBed.inject(Session).enter(profileId);

  if (waiting) {
    TestBed.inject(Orders).advance(slug, 'esperando-rider');
  }

  const fixture = TestBed.createComponent(BranchOrderDetail);

  fixture.componentRef.setInput('codigo', slug);
  fixture.detectChanges();

  return fixture;
}

function offered(fixture: ComponentFixture<BranchOrderDetail>): readonly string[] {
  return [...fixture.nativeElement.querySelectorAll('arena-person-row')]
    .filter((one) => one.querySelector('button'))
    .map((one) => one.querySelector('.arena-people-list__name')?.textContent?.trim() ?? '');
}

describe('BranchOrderDetail', () => {
  it('refuses an order that belongs to another sucursal', () => {
    const host: HTMLElement = render('to-1042').nativeElement;

    expect(host.textContent).toContain('no es de esta sucursal');
    expect(host.querySelector('app-rider-picker')).toBeNull();
  });

  it('says plainly when there is no such order at all', () => {
    expect(render('to-9999').nativeElement.textContent).toContain('No encontramos ese pedido');
  });

  it('offers to assign a rider only while the order is waiting for one', () => {
    expect(
      render('to-1041', 'p-sucursal-restaurante', true).nativeElement.querySelector(
        'app-rider-picker',
      ),
    ).not.toBeNull();
    expect(render('to-1043').nativeElement.querySelector('app-rider-picker')).toBeNull();
  });

  it('offers only riders this sucursal is bound to, by reclutamiento or by a cupo', () => {
    const fixture = render('to-1041', 'p-sucursal-restaurante', true);
    const staffing = TestBed.inject(Staffing);
    const riders = TestBed.inject(Riders);
    const names = offered(fixture);

    expect(names.length).toBeGreaterThan(0);

    for (const name of names) {
      const rider = riders.all().find((one) => one.name === name);

      expect(rider).toBeDefined();
      expect(staffing.covers(rider!.id, 'b-copacabana-miraflores')).toBe(true);
    }
  });

  it('offers a free agent on a cupo beside the riders it recruited', () => {
    const names = offered(render('to-1041', 'p-sucursal-restaurante', true));

    expect(names).toContain('Tania Mamani');
  });

  it('never offers a rider who works for another empresa', () => {
    expect(offered(render('to-1041', 'p-sucursal-restaurante', true))).not.toContain(
      'Gabriela Suárez',
    );
  });

  it('offers no rider who is out of shift, and says so instead', () => {
    const fixture = render('to-1041', 'p-sucursal-restaurante', true);
    const riders = TestBed.inject(Riders);

    for (const name of offered(fixture)) {
      expect(riders.all().find((one) => one.name === name)?.online).toBe(true);
    }
  });

  it('asks for a truck on the interurban leg and a moto on the local one', () => {
    const truck = render('to-2203', 'p-sucursal-importadora', true);
    const riders = TestBed.inject(Riders);

    for (const name of offered(truck)) {
      const rider = riders.all().find((one) => one.name === name);

      expect(rangeOf(rider?.vehicle ?? 'moto')).toBe('interurbano');
    }
  });

  it('takes custody with the rider and explains the relevo in the chat', () => {
    const fixture = render('to-1041', 'p-sucursal-restaurante', true);
    const orders = TestBed.inject(Orders);
    const chat = TestBed.inject(Chat);
    const threadId = orders.bySlug('to-1041')?.threadId ?? '';
    const before = chat.systemLinesOf(threadId).length;

    const button: HTMLElement | null =
      fixture.nativeElement.querySelector('arena-person-row button');

    button?.click();
    fixture.detectChanges();

    const order = orders.bySlug('to-1041');

    expect(order?.state).toBe('en-camino');
    expect(order?.custody.kind).toBe('rider');
    expect(chat.systemLinesOf(threadId).length).toBe(before + 1);
    expect(chat.byId(threadId)?.counterpart.riderId).toBe(order?.custody.riderId);
    expect(chat.lastOf(threadId)?.body).toContain('Ahora hablas con él');
  });

  it('lets the sucursal write only while it is the one holding the order', () => {
    expect(render('to-1041').nativeElement.querySelector('arena-textarea')).not.toBeNull();
    expect(render('to-1043').nativeElement.querySelector('arena-textarea')).toBeNull();
  });

  it('says how many parcels the truck is short of, the same number the buyer sees', () => {
    const host: HTMLElement = render('to-2203', 'p-sucursal-importadora').nativeElement;

    expect(host.textContent).toContain('Faltan 3 pedidos');
  });

  it('names the buyer and where it is going', () => {
    const host: HTMLElement = render('to-1041').nativeElement;

    expect(host.textContent).toContain('Rosa Villca');
    expect(host.textContent).toContain('Entrega a domicilio');
  });

  it('draws the state tag the page head projects, which needs ArenaActions imported', () => {
    expect(
      render('to-1041').nativeElement.querySelector('arena-page-head app-state-tag'),
    ).not.toBeNull();
  });

  it("never shows the comprador's reputation to a sucursal, because it is his alone", () => {
    const order = TestBed.inject(Orders).bySlug('to-1041');
    const host: HTMLElement = render('to-1041').nativeElement;
    const shown = TestBed.inject(Reputation).of(order?.buyer.phone ?? '');
    const text = host.textContent ?? '';

    expect(shown.totalCount).toBeGreaterThan(0);
    expect(text).toContain(order?.buyer.name ?? '');
    expect(text).not.toContain(`${shown.keptCount} de ${shown.totalCount}`);
  });

  it("shows the rider's reputation to the sucursal, because that is the one it decides on", () => {
    const host: HTMLElement = render('to-1041', 'p-sucursal-restaurante', true).nativeElement;
    const marco = TestBed.inject(Reputation).of('r-marco');

    expect(host.textContent).toContain(`${marco.keptCount} de ${marco.totalCount} cumplidos`);
  });
});
