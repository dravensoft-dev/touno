import { APP_BASE_HREF } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Callouts } from '../../../domain/callouts';
import { Riders } from '../../../domain/riders';
import { Session } from '../../../domain/session';
import { RiderFreeAgent } from './free-agent';

function render(profileId = 'p-rider-libre'): ComponentFixture<RiderFreeAgent> {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [provideRouter([]), { provide: APP_BASE_HREF, useValue: '/' }],
  });

  TestBed.inject(Session).enter(profileId);

  const fixture = TestBed.createComponent(RiderFreeAgent);

  fixture.detectChanges();

  return fixture;
}

function button(fixture: ComponentFixture<RiderFreeAgent>, text: string) {
  return [...fixture.nativeElement.querySelectorAll('button')].find((one: HTMLButtonElement) =>
    (one.textContent ?? '').includes(text),
  );
}

describe('RiderFreeAgent', () => {
  it('draws the map and the llamados of his own city, nearest first', () => {
    const host: HTMLElement = render().nativeElement;

    expect(host.querySelector('app-nearby-map')).not.toBeNull();
    expect(host.textContent).toContain('Copacabana Miraflores');
  });

  it('offers nothing to a rider who still owes carreras, and says which it is', () => {
    const host: HTMLElement = render('p-rider').nativeElement;

    expect(host.querySelector('app-nearby-map')).toBeNull();
    expect(host.textContent).toContain('carreras por cumplir');
  });

  it('says he is going, and stops offering the llamados once he is bound', () => {
    const fixture = render();

    button(fixture, 'Voy en camino')?.click();
    fixture.detectChanges();

    expect(TestBed.inject(Callouts).holdingOf('r-diego')?.state).toBe('en-camino');
    expect(fixture.nativeElement.querySelector('app-nearby-map')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Estás con una sucursal');
  });

  it('lets him retire from the sucursal without turning his mode off', () => {
    const fixture = render();

    button(fixture, 'Voy en camino')?.click();
    fixture.detectChanges();

    button(fixture, 'Dejar de ser agente libre')?.click();
    fixture.detectChanges();

    expect(TestBed.inject(Callouts).holdingOf('r-diego')).toBeUndefined();
    expect(TestBed.inject(Riders).byId('r-diego')?.freeAgent).toBe(true);
    expect(fixture.nativeElement.querySelector('app-nearby-map')).not.toBeNull();
  });

  it('shows the map out of shift, and refuses only the going', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: APP_BASE_HREF, useValue: '/' }],
    });
    TestBed.inject(Riders).setOnline('r-diego', false);
    TestBed.inject(Session).enter('p-rider-libre');

    const fixture = TestBed.createComponent(RiderFreeAgent);

    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-nearby-map')).not.toBeNull();
    expect(button(fixture, 'Voy en camino')?.disabled).toBe(true);
  });

  it('never writes a distance in kilometres, because a point here is on the plane', () => {
    expect(render().nativeElement.textContent).not.toContain('km');
  });
});
