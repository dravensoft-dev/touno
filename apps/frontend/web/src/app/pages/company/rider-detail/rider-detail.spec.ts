import { APP_BASE_HREF } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Agreements } from '../../../domain/agreements';
import { Session } from '../../../domain/session';
import { CompanyRiderDetail } from './rider-detail';

function render(
  slug: string,
  profileId = 'p-empresa-importadora',
): ComponentFixture<CompanyRiderDetail> {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [provideRouter([]), { provide: APP_BASE_HREF, useValue: '/' }],
  });

  TestBed.inject(Session).enter(profileId);

  const fixture = TestBed.createComponent(CompanyRiderDetail);

  fixture.componentRef.setInput('slug', slug);
  fixture.detectChanges();

  return fixture;
}

function boxes(fixture: ComponentFixture<CompanyRiderDetail>): readonly string[] {
  return [...fixture.nativeElement.querySelectorAll('arena-checkbox')].map(
    (one) => one.textContent?.trim() ?? '',
  );
}

function button(fixture: ComponentFixture<CompanyRiderDetail>, text: string) {
  return [...fixture.nativeElement.querySelectorAll('button')].find((one: HTMLButtonElement) =>
    (one.textContent ?? '').includes(text),
  );
}

function fill(fixture: ComponentFixture<CompanyRiderDetail>, rate: string): void {
  const field: HTMLInputElement = fixture.nativeElement.querySelector('input[type="number"]');

  field.value = rate;
  field.dispatchEvent(new Event('input'));
  fixture.detectChanges();
}

function pickPeak(fixture: ComponentFixture<CompanyRiderDetail>): void {
  fixture.debugElement
    .query((one) => one.name === 'arena-radio-group')
    .componentInstance.change.emit('hora-pico');
  fixture.detectChanges();
}

describe('CompanyRiderDetail', () => {
  it('offers an urban rider only the sucursales of his own city', () => {
    const drawn = boxes(render('noemi-flores'));

    expect(drawn.length).toBe(1);
    expect(drawn[0]).toContain('Ale La Paz');
  });

  it('says which sucursales an urban rider cannot reach, rather than hiding them', () => {
    const host: HTMLElement = render('noemi-flores').nativeElement;

    expect(host.textContent).toContain('fuera de su alcance');
  });

  it('offers a truck rider every sucursal, because he crosses cities', () => {
    const drawn = boxes(render('elias-poma'));

    expect(drawn.length).toBe(3);
  });

  it('refuses to propose until a sucursal and a rate are chosen', () => {
    const fixture = render('elias-poma');

    expect(button(fixture, 'Enviar la propuesta')?.hasAttribute('disabled')).toBe(true);

    fixture.nativeElement.querySelector('input[type="checkbox"]').click();
    fixture.detectChanges();

    expect(button(fixture, 'Enviar la propuesta')?.hasAttribute('disabled')).toBe(true);

    fill(fixture, '250');

    expect(button(fixture, 'Enviar la propuesta')?.hasAttribute('disabled')).toBe(false);
  });

  it('proposes scoped to the chosen sucursales, and buys nothing until he accepts', () => {
    const fixture = render('elias-poma');
    const agreements = TestBed.inject(Agreements);

    fixture.nativeElement.querySelector('input[type="checkbox"]').click();
    fixture.detectChanges();
    fill(fixture, '250');
    button(fixture, 'Enviar la propuesta')?.click();
    fixture.detectChanges();

    const proposed = agreements.between('r-elias', 'c-ale');

    expect(proposed?.state).toBe('pendiente');
    expect(proposed?.initiatedBy).toBe('empresa');
    expect(proposed?.branchIds.length).toBe(1);
    expect(agreements.covers('r-elias', proposed?.branchIds[0] ?? '')).toBe(false);
  });

  it('offers no proposal to a rider it already has an agreement with', () => {
    const fixture = render('hugo-barrientos');

    expect(button(fixture, 'Enviar la propuesta')).toBeUndefined();
    expect(fixture.nativeElement.textContent).toContain('Trabajando contigo');
  });

  it('lets the empresa answer an application the rider sent', () => {
    const fixture = render('ivan-mamani');

    expect(fixture.nativeElement.textContent).toContain('Se postuló y espera tu respuesta');
    expect(button(fixture, 'Aceptar su postulación')).toBeDefined();
    expect(button(fixture, 'Enviar la propuesta')).toBeUndefined();
  });

  it('accepting an application is what lets the sucursal assign him', () => {
    const fixture = render('ivan-mamani');
    const agreements = TestBed.inject(Agreements);

    expect(agreements.covers('r-ivan', 'b-ale-la-paz')).toBe(false);

    button(fixture, 'Aceptar su postulación')?.click();
    fixture.detectChanges();

    expect(agreements.covers('r-ivan', 'b-ale-la-paz')).toBe(true);
  });

  it('cannot answer a proposal the empresa made itself', () => {
    const fixture = render('elias-poma');

    fixture.nativeElement.querySelector('input[type="checkbox"]').click();
    fixture.detectChanges();
    fill(fixture, '250');
    button(fixture, 'Enviar la propuesta')?.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('esperas su respuesta');
    expect(button(fixture, 'Aceptar su postulación')).toBeUndefined();
  });

  it('says the rider is out of reach when the empresa has no sucursal in his city', () => {
    const host: HTMLElement = render('rosario-colque').nativeElement;

    expect(host.textContent).toContain('No tienes sucursal donde él trabaja');
  });

  it('says plainly when there is no such rider', () => {
    expect(render('nadie').nativeElement.textContent).toContain('No encontramos ese rider');
  });

  it('asks for the clase de reclutamiento and the carreras', () => {
    const host: HTMLElement = render('ivan-mamani', 'p-empresa-restaurante').nativeElement;

    expect(host.textContent).toContain('Carreras que le das');
    expect(host.textContent).toContain('Touno no permite menos de');
    expect(host.textContent).toContain('sólo puede tener uno en total');
  });

  it('says why a rider who still owes runs cannot take hora pico', () => {
    const fixture = render('noemi-flores');

    expect(TestBed.inject(Agreements).runsPendingOf('r-noemi')).toBeGreaterThan(0);

    pickPeak(fixture);

    expect(fixture.nativeElement.textContent).toContain(
      'Ahora no puede tomar un reclutamiento de hora pico',
    );
    expect(button(fixture, 'Enviar la propuesta')?.hasAttribute('disabled')).toBe(true);
  });

  it('lets the gerente de empresa recruit in hora pico when the rider is free', () => {
    const fixture = render('ivan-mamani', 'p-empresa-restaurante');

    expect(TestBed.inject(Agreements).runsPendingOf('r-ivan')).toBe(0);

    pickPeak(fixture);

    expect(fixture.nativeElement.textContent).not.toContain(
      'Ahora no puede tomar un reclutamiento de hora pico',
    );
    expect(fixture.nativeElement.textContent).toContain('ninguna empresa puede darle dos');
  });

  it('names the clase and the runs left on a reclutamiento already running', () => {
    const host: HTMLElement = render('hugo-barrientos').nativeElement;

    expect(host.textContent).toContain('Reclutamiento normal');
    expect(host.textContent).toContain('carreras');
  });
});
