import { APP_BASE_HREF } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Chat } from '../../../domain/chat';
import { Loads } from '../../../domain/loads';
import { Orders } from '../../../domain/orders';
import { Session } from '../../../domain/session';
import { RiderLoad } from './load';

function render(id: string, profileId = 'p-rider-camion'): ComponentFixture<RiderLoad> {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [provideRouter([]), { provide: APP_BASE_HREF, useValue: '/' }],
  });

  TestBed.inject(Session).enter(profileId);

  const fixture = TestBed.createComponent(RiderLoad);

  fixture.componentRef.setInput('id', id);
  fixture.detectChanges();

  return fixture;
}

function depart(fixture: ComponentFixture<RiderLoad>) {
  return [...fixture.nativeElement.querySelectorAll('button')].find((one: HTMLButtonElement) =>
    (one.textContent ?? '').includes('Salir con la carga'),
  );
}

describe('RiderLoad', () => {
  it('says how many parcels are missing while the truck fills', () => {
    const host: HTMLElement = render('cg-3301').nativeElement;

    expect(host.textContent).toContain('En espera a más pedidos');
    expect(host.textContent).toContain('Faltan 3 pedidos');
  });

  it('refuses to leave until the load is complete', () => {
    const fixture = render('cg-3301');

    expect(depart(fixture)?.hasAttribute('disabled')).toBe(true);
  });

  it('lets the truck leave once it is full, and says so', () => {
    const fixture = render('cg-3301');
    const loads = TestBed.inject(Loads);

    while (!loads.isFull('cg-3301')) {
      loads.add('cg-3301', `TO-90${loads.byId('cg-3301')?.orderCodes.length}`);
    }

    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('La carga está completa');
    expect(depart(fixture)?.hasAttribute('disabled')).toBe(false);
  });

  it('leaving puts every parcel on the road and tells each buyer who carries it', () => {
    const fixture = render('cg-3301');
    const loads = TestBed.inject(Loads);
    const orders = TestBed.inject(Orders);
    const chat = TestBed.inject(Chat);
    const threadId = orders.bySlug('to-2203')?.threadId ?? '';
    const before = chat.systemLinesOf(threadId).length;

    while (!loads.isFull('cg-3301')) {
      loads.add('cg-3301', `TO-90${loads.byId('cg-3301')?.orderCodes.length}`);
    }

    fixture.detectChanges();
    depart(fixture)?.click();
    fixture.detectChanges();

    expect(loads.byId('cg-3301')?.state).toBe('en-ruta');
    expect(orders.bySlug('to-2203')?.state).toBe('en-ruta-interurbana');
    expect(chat.systemLinesOf(threadId).length).toBe(before + 1);
    expect(chat.byId(threadId)?.counterpart.riderId).toBe('r-hugo');
    expect(chat.lastOf(threadId)?.body).toContain('Hugo Barrientos');
  });

  it('says what happens to each parcel at the other end', () => {
    const host: HTMLElement = render('cg-3301').nativeElement;

    expect(host.textContent).toContain('Un rider local lo lleva');
  });

  it('refuses a load driven by someone else', () => {
    expect(render('cg-3302').nativeElement.textContent).toContain('no es tuya');
  });

  it('offers no departure on a load already on the road', () => {
    const fixture = render('cg-3303');

    expect(depart(fixture)).toBeUndefined();
  });
});
