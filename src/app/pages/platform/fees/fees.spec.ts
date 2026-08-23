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
});
