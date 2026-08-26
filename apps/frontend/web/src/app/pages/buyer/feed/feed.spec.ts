import { APP_BASE_HREF } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Businesses } from '../../../domain/businesses';
import { Session } from '../../../domain/session';
import { Feed } from './feed';

function render(): ComponentFixture<Feed> {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [provideRouter([]), { provide: APP_BASE_HREF, useValue: '/' }],
  });

  TestBed.inject(Session).enter('p-comprador');

  const fixture = TestBed.createComponent(Feed);

  fixture.detectChanges();

  return fixture;
}

function cards(fixture: ComponentFixture<Feed>): readonly Element[] {
  return [...fixture.nativeElement.querySelectorAll('app-branch-card')];
}

describe('Feed', () => {
  it('splits what a buyer can order into the two verticals', () => {
    const host: HTMLElement = render().nativeElement;

    expect(host.textContent).toContain('Comida');
    expect(host.textContent).toContain('Encomiendas');
  });

  it('lists negocios rather than loose products, so a price belongs to a sucursal', () => {
    const fixture = render();

    expect(cards(fixture).length).toBeGreaterThan(0);
    expect(fixture.nativeElement.querySelectorAll('app-product-card').length).toBe(0);
  });

  it('offers only sucursales that are open in the city on screen', () => {
    const fixture = render();
    const businesses = TestBed.inject(Businesses);
    const names = cards(fixture).map((one) => one.textContent ?? '');
    const closed = businesses.branches().filter((one) => !one.open);

    expect(closed.length).toBeGreaterThan(0);

    for (const branch of closed) {
      expect(names.some((one) => one.includes(branch.name))).toBe(false);
    }
  });

  it('marks the negocios that are running a discount', () => {
    const host: HTMLElement = render().nativeElement;

    expect(host.textContent).toContain('Con promoción');
  });
});
