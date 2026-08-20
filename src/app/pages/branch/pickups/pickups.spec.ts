import { APP_BASE_HREF } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Chat } from '../../../domain/chat';
import { Orders } from '../../../domain/orders';
import { Session } from '../../../domain/session';
import { BranchPickups } from './pickups';

function render(profileId = 'p-sucursal-importadora'): ComponentFixture<BranchPickups> {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [provideRouter([]), { provide: APP_BASE_HREF, useValue: '/' }],
  });

  TestBed.inject(Session).enter(profileId);

  const fixture = TestBed.createComponent(BranchPickups);

  fixture.detectChanges();

  return fixture;
}

function scanWith(fixture: ComponentFixture<BranchPickups>, code: string): void {
  const field: HTMLInputElement = fixture.nativeElement.querySelector('input');

  field.value = code;
  field.dispatchEvent(new Event('input'));
  fixture.detectChanges();

  const confirm = [...fixture.nativeElement.querySelectorAll('button')].find(
    (one: HTMLButtonElement) => (one.textContent ?? '').includes('Confirmar con el código'),
  );

  confirm?.click();
  fixture.detectChanges();
}

function startFirstScan(fixture: ComponentFixture<BranchPickups>): void {
  const button = [...fixture.nativeElement.querySelectorAll('button')].find(
    (one: HTMLButtonElement) => (one.textContent ?? '').trim() === 'Escanear',
  );

  button?.click();
  fixture.detectChanges();
}

describe('BranchPickups', () => {
  it('draws no scanner until a pedido is chosen', () => {
    expect(render().nativeElement.querySelector('app-scan-panel')).toBeNull();
  });

  it('lists the parcel waiting at this counter, and not one waiting at another', () => {
    const host: HTMLElement = render().nativeElement;

    expect(host.textContent).toContain('TO-2214');
    expect(host.textContent).not.toContain('TO-2206');
  });

  it('lists what the sucursal has to hand over, and what it has to deliver', () => {
    const host: HTMLElement = render('p-sucursal-restaurante').nativeElement;

    expect(host.textContent).toContain('Nada en mostrador');
  });

  it('opens the scanner for a parcel waiting at the counter', () => {
    const fixture = render();

    startFirstScan(fixture);

    expect(fixture.nativeElement.querySelector('app-scan-panel')).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Nadia Choque');
  });

  it('refuses a code that belongs to another pedido, and delivers nothing', () => {
    const fixture = render();
    const orders = TestBed.inject(Orders);

    startFirstScan(fixture);
    scanWith(fixture, 'TO-1043');

    expect(orders.bySlug('to-2214')?.state).toBe('listo-para-recojo');
    expect(orders.bySlug('to-2214')?.scannedAt).toBeUndefined();
    expect(fixture.nativeElement.querySelector('app-scan-panel')).not.toBeNull();
  });

  it('delivers on the right code, and records the sucursal as who read it', () => {
    const fixture = render();
    const orders = TestBed.inject(Orders);
    const chat = TestBed.inject(Chat);
    const threadId = orders.bySlug('to-2214')?.threadId ?? '';

    startFirstScan(fixture);
    scanWith(fixture, 'to-2214');

    const order = orders.bySlug('to-2214');

    expect(order?.state).toBe('entregado');
    expect(order?.scannedBy).toBe('b-ale-la-paz');
    expect(order?.scannedAt).toBeDefined();
    expect(chat.lastOf(threadId)?.author).toBe('sistema');
    expect(chat.lastOf(threadId)?.body).toContain('escaneó tu código en mostrador');
  });

  it('closes the scanner once the pedido is handed over', () => {
    const fixture = render();

    startFirstScan(fixture);
    scanWith(fixture, 'to-2214');

    expect(fixture.nativeElement.querySelector('app-scan-panel')).toBeNull();
  });

  it('shows the loads coming to this sucursal, and only those', () => {
    const host: HTMLElement = render().nativeElement;

    expect(host.textContent).toContain('Ningún camión en ruta hacia aquí');
  });
});
