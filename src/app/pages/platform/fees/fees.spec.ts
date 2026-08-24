import { APP_BASE_HREF } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Businesses } from '../../../domain/businesses';
import { Platform } from '../../../domain/platform';
import { Session } from '../../../domain/session';
import { PlatformFees } from './fees';

function render(): ComponentFixture<PlatformFees> {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [provideRouter([]), { provide: APP_BASE_HREF, useValue: '/' }],
  });

  TestBed.inject(Session).enter('p-touno');

  const fixture = TestBed.createComponent(PlatformFees);

  fixture.detectChanges();

  return fixture;
}

function save(fixture: ComponentFixture<PlatformFees>, label: string, value: string): void {
  const field = [...fixture.nativeElement.querySelectorAll('arena-input')].find((one: Element) =>
    (one.textContent ?? '').includes(label),
  ) as Element;
  const input = field.querySelector('input') as HTMLInputElement;

  input.value = value;
  input.dispatchEvent(new Event('input'));
  fixture.detectChanges();

  [...fixture.nativeElement.querySelectorAll('button')]
    .find((one: HTMLButtonElement) => (one.textContent ?? '').includes(label))
    ?.click();
  fixture.detectChanges();
}

describe('PlatformFees', () => {
  it('names every value Touno sets for the whole network', () => {
    const host: HTMLElement = render().nativeElement;

    expect(host.textContent).toContain('Comisión de Touno');
    expect(host.textContent).toContain('Envío base mínimo');
    expect(host.textContent).toContain('Carreras mínimas');
  });

  it('says the distance rates are plane units and never kilometres', () => {
    const host: HTMLElement = render().nativeElement;

    expect(host.textContent).toContain('no kilómetros');
    expect(host.textContent).not.toContain('km');
  });

  it('lifts an empresa that had raised less when the universal floor goes up', () => {
    render();

    const businesses = TestBed.inject(Businesses);
    const platform = TestBed.inject(Platform);
    const before = businesses.weatherFeeOf('c-ale');

    platform.patch({ weatherFeeBob: before + 7 });

    expect(businesses.weatherFeeOf('c-ale')).toBe(before + 7);
  });

  it('sets the fija a rider is paid at least, one for each way of working', () => {
    const host: HTMLElement = render().nativeElement;

    expect(host.textContent).toContain('Fija mínima de un agente libre');
    expect(host.textContent).toContain('Fija mínima de un reclutamiento normal');
    expect(host.textContent).toContain('Fija mínima de un reclutamiento de hora pico');
  });

  it('writes one of the three without disturbing the other two', () => {
    const fixture = render();
    const platform = TestBed.inject(Platform);

    save(fixture, 'Fija mínima de un agente libre', '10');

    expect(platform.riderBaseBob()['agente-libre']).toBe(10);
    expect(platform.riderBaseBob().normal).toBe(12);
  });

  it('refuses a fija that would pay a free agent more than a recruited rider, and says why', () => {
    const fixture = render();
    const platform = TestBed.inject(Platform);

    save(fixture, 'Fija mínima de un agente libre', '30');

    expect(platform.riderBaseBob()['agente-libre']).toBe(8);
    expect(fixture.nativeElement.textContent).toContain('sube con el compromiso');
  });
});
