import { APP_BASE_HREF } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Callouts } from '../../../domain/callouts';
import { Chat } from '../../../domain/chat';
import { Orders } from '../../../domain/orders';
import { Session } from '../../../domain/session';
import { RiderScan } from './scan';

function render(slug: string, profileId = 'p-rider'): ComponentFixture<RiderScan> {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [provideRouter([]), { provide: APP_BASE_HREF, useValue: '/' }],
  });

  TestBed.inject(Session).enter(profileId);

  const fixture = TestBed.createComponent(RiderScan);

  fixture.componentRef.setInput('codigo', slug);
  fixture.detectChanges();

  return fixture;
}

function asFreeAgent(): ComponentFixture<RiderScan> {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [provideRouter([]), { provide: APP_BASE_HREF, useValue: '/' }],
  });

  const callouts = TestBed.inject(Callouts);
  const claim = callouts.claim('lc-601', 'r-diego', true);

  callouts.arrive(claim.id);
  TestBed.inject(Orders).assign('to-1043', 'origen', 'r-diego', 'b-copacabana-miraflores');
  TestBed.inject(Session).enter('p-rider-libre');

  const fixture = TestBed.createComponent(RiderScan);

  fixture.componentRef.setInput('codigo', 'to-1043');
  fixture.detectChanges();

  return fixture;
}

function scanWith(fixture: ComponentFixture<RiderScan>, code: string): void {
  const field: HTMLInputElement = fixture.nativeElement.querySelector('input');

  field.value = code;
  field.dispatchEvent(new Event('input'));
  fixture.detectChanges();

  [...fixture.nativeElement.querySelectorAll('button')]
    .find((one: HTMLButtonElement) => (one.textContent ?? '').includes('Confirmar con el código'))
    ?.click();

  fixture.detectChanges();
}

describe('RiderScan', () => {
  it('opens for a pedido the rider is carrying right now', () => {
    const host: HTMLElement = render('to-1043').nativeElement;

    expect(host.querySelector('app-scan-panel')).not.toBeNull();
    expect(host.textContent).toContain('Rosa Villca');
  });

  it('refuses a pedido that is not his to deliver', () => {
    const host: HTMLElement = render('to-1044').nativeElement;

    expect(host.querySelector('app-scan-panel')).toBeNull();
    expect(host.textContent).toContain('no es tuyo, o ya no lo llevas');
  });

  it('refuses a pedido he carried on a leg that is over', () => {
    const host: HTMLElement = render('to-1045').nativeElement;

    expect(host.querySelector('app-scan-panel')).toBeNull();
  });

  it('delivers nothing on a code from another pedido', () => {
    const fixture = render('to-1043');
    const orders = TestBed.inject(Orders);

    scanWith(fixture, 'TO-2205');

    expect(orders.bySlug('to-1043')?.state).toBe('en-camino');
    expect(orders.bySlug('to-1043')?.scannedAt).toBeUndefined();
  });

  it('closes the pedido on the right code, and records who read it', () => {
    const fixture = render('to-1043');
    const orders = TestBed.inject(Orders);
    const chat = TestBed.inject(Chat);
    const threadId = orders.bySlug('to-1043')?.threadId ?? '';

    scanWith(fixture, 'to-1043');

    const order = orders.bySlug('to-1043');

    expect(order?.state).toBe('entregado');
    expect(order?.scannedBy).toBe('r-marco');
    expect(order?.scannedAt).toBeDefined();
    expect(chat.lastOf(threadId)?.body).toContain('escaneó tu código');
  });

  it('says it is done and offers no second scan', () => {
    const fixture = render('to-1043');

    scanWith(fixture, 'to-1043');

    expect(fixture.nativeElement.textContent).toContain('El código coincidió');
    expect(fixture.nativeElement.querySelector('app-scan-panel')).toBeNull();
  });

  it('asks a free agent whether he stays, the moment the pedido is closed', () => {
    const fixture = asFreeAgent();

    expect(fixture.nativeElement.querySelector('app-free-agent-prompt')).toBeNull();

    scanWith(fixture, 'to-1043');

    expect(fixture.nativeElement.querySelector('app-free-agent-prompt')).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Copacabana');
  });

  it('asks a recruited rider nothing, because he did not come by a llamado', () => {
    const fixture = render('to-1043');

    scanWith(fixture, 'to-1043');

    expect(fixture.nativeElement.querySelector('app-free-agent-prompt')).toBeNull();
  });

  it('ends the trato when he says he is going, and leaves his free agent mode alone', () => {
    const fixture = asFreeAgent();
    const callouts = TestBed.inject(Callouts);

    scanWith(fixture, 'to-1043');

    [...fixture.nativeElement.querySelectorAll('button')]
      .find((one: HTMLButtonElement) => (one.textContent ?? '').startsWith('Dejar de ser'))
      ?.click();
    fixture.detectChanges();

    expect(callouts.holdingOf('r-diego')).toBeUndefined();
    expect(fixture.nativeElement.querySelector('app-free-agent-prompt')).toBeNull();
  });

  it('keeps the trato when he says he stays', () => {
    const fixture = asFreeAgent();
    const callouts = TestBed.inject(Callouts);

    scanWith(fixture, 'to-1043');

    [...fixture.nativeElement.querySelectorAll('button')]
      .find((one: HTMLButtonElement) => (one.textContent ?? '').startsWith('Seguir como'))
      ?.click();
    fixture.detectChanges();

    expect(callouts.holdingOf('r-diego')?.state).toBe('trabajando');
    expect(fixture.nativeElement.querySelector('app-free-agent-prompt')).toBeNull();
  });
});
