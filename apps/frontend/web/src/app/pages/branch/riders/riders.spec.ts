import { APP_BASE_HREF } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Callouts } from '../../../domain/callouts';
import { Session } from '../../../domain/session';
import { BranchRiders } from './riders';

function render(profileId = 'p-sucursal-restaurante'): ComponentFixture<BranchRiders> {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [provideRouter([]), { provide: APP_BASE_HREF, useValue: '/' }],
  });

  TestBed.inject(Session).enter(profileId);

  const fixture = TestBed.createComponent(BranchRiders);

  fixture.detectChanges();

  return fixture;
}

function fill(fixture: ComponentFixture<BranchRiders>, at: number, value: string): void {
  const field = fixture.nativeElement.querySelectorAll('input[type="number"]')[
    at
  ] as HTMLInputElement;

  field.value = value;
  field.dispatchEvent(new Event('input'));
  fixture.detectChanges();
}

function button(fixture: ComponentFixture<BranchRiders>, text: string) {
  return [...fixture.nativeElement.querySelectorAll('button')].find((one: HTMLButtonElement) =>
    (one.textContent ?? '').includes(text),
  );
}

describe('BranchRiders', () => {
  it('shows the llamado it already has open, and who is coming to it', () => {
    const host: HTMLElement = render().nativeElement;

    expect(host.textContent).toContain('Buscar agentes libres');
    expect(host.textContent).toContain('Tania Mamani');
    expect(button(render(), 'Cerrar el llamado')).toBeDefined();
  });

  it('closes the llamado, and then offers to publish a new one', () => {
    const fixture = render();

    button(fixture, 'Cerrar el llamado')?.click();
    fixture.detectChanges();

    expect(TestBed.inject(Callouts).liveOf('b-copacabana-miraflores')).toBeUndefined();
    expect(button(fixture, 'Publicar el llamado')).toBeDefined();
  });

  it('refuses to publish a llamado paying under what Touno pays an agente libre', () => {
    const fixture = render();

    button(fixture, 'Cerrar el llamado')?.click();
    fixture.detectChanges();

    fill(fixture, 0, '2');
    fill(fixture, 1, '1');

    expect(button(fixture, 'Publicar el llamado')?.disabled).toBe(true);
  });

  it('publishes a llamado for itself alone, with the cupos and the fija it chose', () => {
    const fixture = render();
    const callouts = TestBed.inject(Callouts);

    button(fixture, 'Cerrar el llamado')?.click();
    fixture.detectChanges();

    fill(fixture, 0, '2');
    fill(fixture, 1, '14');
    button(fixture, 'Publicar el llamado')?.click();
    fixture.detectChanges();

    const live = callouts.liveOf('b-copacabana-miraflores');

    expect(live?.cupos).toBe(2);
    expect(live?.fixedBob).toBe(14);
    expect(live?.branchId).toBe('b-copacabana-miraflores');
  });

  it('offers both clases of reclutamiento now, and never a scope beyond itself', () => {
    const host: HTMLElement = render().nativeElement;
    const labels = [...host.querySelectorAll('arena-radio')].map((one) => one.textContent ?? '');

    expect(labels.some((one) => one.includes('Normal'))).toBe(true);
    expect(labels.some((one) => one.includes('Hora pico'))).toBe(true);
    expect(host.textContent).toContain('únicamente para sí misma');
  });
});
