import { APP_BASE_HREF } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Home } from './home';

describe('Home', () => {
  function render(baseHref = '/'): HTMLElement {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: APP_BASE_HREF, useValue: baseHref }],
    });

    const fixture = TestBed.createComponent(Home);
    fixture.detectChanges();

    return fixture.nativeElement;
  }

  it('is the one public door, so it names every other public surface', () => {
    const doors = [...render().querySelectorAll('arena-card')].map((one) =>
      (one.textContent ?? '').trim(),
    );

    expect(doors.length).toBe(4);
    expect(doors[0]).toContain('restaurante');
    expect(doors[1]).toContain('importadora');
    expect(doors[2]).toContain('Maneja con Touno');
    expect(doors[3]).toContain('Manual');
  });

  it('carries the base href into every door, because a card writes its own href', () => {
    const hrefs = [...render('/touno/').querySelectorAll('arena-card a')].map((one) =>
      one.getAttribute('href'),
    );

    expect(hrefs).toEqual([
      '/touno/restaurantes',
      '/touno/tiendas',
      '/touno/riders',
      '/touno/manual',
    ]);
  });

  it('sells rather than lists, so no catalogue survives on it', () => {
    const host = render();

    expect(host.querySelector('app-product-card')).toBeNull();
    expect(host.querySelector('app-branch-card')).toBeNull();
  });

  it('counts what it claims out of the fixtures, never out of a written number', () => {
    const text = render().textContent ?? '';

    expect(text).toMatch(/\d+ sucursales de restaurante atendiendo ahora/);
    expect(text).toMatch(/\d+ sucursales de importadora con stock/);
    expect(text).toMatch(/\d+ empresas y \d+ riders/);
  });

  it('describes the site to a crawler without an ItemList it no longer holds', () => {
    const keys = [...render().querySelectorAll('app-structured-data')].length;

    expect(keys).toBe(2);
  });
});
