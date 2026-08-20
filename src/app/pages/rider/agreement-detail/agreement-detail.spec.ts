import { APP_BASE_HREF } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Agreements } from '../../../domain/agreements';
import { Session } from '../../../domain/session';
import { RiderAgreementDetail } from './agreement-detail';

function render(id: string, profileId = 'p-rider'): ComponentFixture<RiderAgreementDetail> {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [provideRouter([]), { provide: APP_BASE_HREF, useValue: '/' }],
  });

  TestBed.inject(Session).enter(profileId);

  const fixture = TestBed.createComponent(RiderAgreementDetail);

  fixture.componentRef.setInput('id', id);
  fixture.detectChanges();

  return fixture;
}

function button(fixture: ComponentFixture<RiderAgreementDetail>, text: string) {
  return [...fixture.nativeElement.querySelectorAll('button')].find((one: HTMLButtonElement) =>
    (one.textContent ?? '').includes(text),
  );
}

describe('RiderAgreementDetail', () => {
  it('lets the rider answer an invitation the empresa sent', () => {
    const fixture = render('ag-517');

    expect(fixture.nativeElement.textContent).toContain('Esperan tu respuesta');
    expect(button(fixture, 'Aceptar el acuerdo')).toBeDefined();
    expect(button(fixture, 'Rechazar')).toBeDefined();
  });

  it('offers no answer on a proposal the rider made himself', () => {
    const fixture = render('ag-510');

    expect(fixture.nativeElement.textContent).toContain('Esperas la respuesta de la empresa');
    expect(button(fixture, 'Aceptar el acuerdo')).toBeUndefined();
  });

  it('offers no answer on an agreement already running', () => {
    const fixture = render('ag-501');

    expect(fixture.nativeElement.textContent).toContain('Acuerdo en marcha');
    expect(button(fixture, 'Aceptar el acuerdo')).toBeUndefined();
  });

  it('accepting is what puts the rider to work, and not before', () => {
    const fixture = render('ag-517');
    const agreements = TestBed.inject(Agreements);

    expect(agreements.covers('r-marco', 'b-illimani-san-miguel')).toBe(false);

    button(fixture, 'Aceptar el acuerdo')?.click();
    fixture.detectChanges();

    expect(agreements.byId('ag-517')?.state).toBe('activo');
    expect(agreements.covers('r-marco', 'b-illimani-san-miguel')).toBe(true);
  });

  it('rejecting closes it and leaves the rider out', () => {
    const fixture = render('ag-517');
    const agreements = TestBed.inject(Agreements);

    button(fixture, 'Rechazar')?.click();
    fixture.detectChanges();

    expect(agreements.byId('ag-517')?.state).toBe('rechazado');
    expect(agreements.covers('r-marco', 'b-illimani-san-miguel')).toBe(false);
  });

  it('names every sucursal the agreement covers, so the scope is not a surprise', () => {
    const host: HTMLElement = render('ag-501').nativeElement;

    expect(host.textContent).toContain('Copacabana Miraflores');
    expect(host.textContent).toContain('Copacabana Sopocachi');
  });

  it('refuses an agreement addressed to another rider', () => {
    expect(render('ag-508').nativeElement.textContent).toContain('no es tuyo');
  });

  it('says plainly when there is no such agreement', () => {
    expect(render('ag-9999').nativeElement.textContent).toContain('No encontramos ese acuerdo');
  });
});
