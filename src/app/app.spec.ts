import { APP_BASE_HREF } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { ARENA_MAIN_ID } from '@dravensoft/arena-angular';
import { App } from './app';
import { Session } from './domain/session';

describe('App', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  it('puts the skip link ahead of everything else that can take focus', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const host: HTMLElement = fixture.nativeElement;
    const focusable = host.querySelectorAll<HTMLElement>('a[href], button');

    expect(focusable.length).toBeGreaterThan(0);
    expect(focusable[0].getAttribute('href')).toBe(`#${ARENA_MAIN_ID}`);
  });

  it('renders the main landmark the skip link points at', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const host: HTMLElement = fixture.nativeElement;

    expect(host.querySelector(`main#${ARENA_MAIN_ID}`)).not.toBeNull();
  });
});

describe('App panel destinations', () => {
  async function railAndBarUnder(baseHref: string): Promise<readonly (string | null)[][]> {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'carrito', children: [] }]),
        { provide: APP_BASE_HREF, useValue: baseHref },
      ],
    });

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    await TestBed.inject(Router).navigateByUrl('/carrito');
    fixture.detectChanges();

    const host: HTMLElement = fixture.nativeElement;

    return [
      [...host.querySelectorAll('arena-side-nav a')].map((one) => one.getAttribute('href')),
      [...host.querySelectorAll('arena-bottom-nav a')].map((one) => one.getAttribute('href')),
    ];
  }

  it('addresses every destination from the root when the base href is the root', async () => {
    const [rail, bar] = await railAndBarUnder('/');

    expect(rail).toEqual(['/feed', '/', '/carrito', '/mis-pedidos']);
    expect(bar).toEqual(rail);
  });

  it('carries the base href into every destination when the site is served from a subpath', async () => {
    const [rail, bar] = await railAndBarUnder('/touno/');

    expect(rail).toEqual(['/touno/feed', '/touno/', '/touno/carrito', '/touno/mis-pedidos']);
    expect(bar).toEqual(rail);
  });
});

describe('App gate', () => {
  async function gateAt(path: string, profileId?: string): Promise<HTMLElement> {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'sucursal/pedidos', children: [] },
          { path: 'empresa/sucursales', children: [] },
        ]),
        { provide: APP_BASE_HREF, useValue: '/' },
      ],
    });

    const fixture = TestBed.createComponent(App);

    if (profileId) {
      TestBed.inject(Session).enter(profileId);
    }

    fixture.detectChanges();
    await TestBed.inject(Router).navigateByUrl(path);
    fixture.detectChanges();

    return fixture.nativeElement;
  }

  it('closes a panel to whoever is not signed in, and names the role it wants', async () => {
    const host = await gateAt('/sucursal/pedidos');

    expect(host.querySelector('arena-unauth-card')).not.toBeNull();
    expect(host.textContent).toContain('gerente de sucursal');
  });

  it('offers only the profiles that open this panel, plus a way to the rest', async () => {
    const host = await gateAt('/sucursal/pedidos');
    const offered = [...host.querySelectorAll('arena-unauth-card arena-button')].map(
      (one) => one.textContent ?? '',
    );

    expect(offered.length).toBe(3);
    expect(offered[0]).toContain('restaurante');
    expect(offered[1]).toContain('importadora');
    expect(offered[2]).toContain('Ver todos los perfiles');
  });

  it('opens the same panel to both verticals of one role', async () => {
    for (const profile of ['p-sucursal-restaurante', 'p-sucursal-importadora']) {
      const host = await gateAt('/sucursal/pedidos', profile);

      expect(host.querySelector('arena-unauth-card')).toBeNull();
    }
  });

  it('keeps a gerente de sucursal out of the empresa panel', async () => {
    const host = await gateAt('/empresa/sucursales', 'p-sucursal-restaurante');

    expect(host.querySelector('arena-unauth-card')).not.toBeNull();
  });

  it('shows the carta to a restaurant and the catálogo to an importadora', async () => {
    const carta = await gateAt('/sucursal/pedidos', 'p-sucursal-restaurante');
    const cartaRail = [...carta.querySelectorAll('arena-side-nav a')].map((one) =>
      one.getAttribute('href'),
    );

    expect(cartaRail).toContain('/sucursal/carta');
    expect(cartaRail).not.toContain('/sucursal/catalogo');

    const catalogo = await gateAt('/sucursal/pedidos', 'p-sucursal-importadora');
    const catalogoRail = [...catalogo.querySelectorAll('arena-side-nav a')].map((one) =>
      one.getAttribute('href'),
    );

    expect(catalogoRail).toContain('/sucursal/catalogo');
    expect(catalogoRail).not.toContain('/sucursal/carta');
  });

  it('shows neither of the two while nobody is signed in, which is what prerender writes', async () => {
    const host = await gateAt('/sucursal/pedidos');
    const rail = [...host.querySelectorAll('arena-side-nav a')].map((one) =>
      one.getAttribute('href'),
    );

    expect(rail).toContain('/sucursal/pedidos');
    expect(rail).not.toContain('/sucursal/carta');
    expect(rail).not.toContain('/sucursal/catalogo');
  });
});

describe('App sections menu', () => {
  async function open(): Promise<{
    fixture: ComponentFixture<App>;
    labels: readonly string[];
    rows: readonly HTMLElement[];
  }> {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const host: HTMLElement = fixture.nativeElement;
    const trigger = host.querySelector<HTMLButtonElement>('.shell-nav__menu button');

    expect(trigger).not.toBeNull();
    trigger?.click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    return {
      fixture,
      labels: [...host.querySelectorAll('.shell-nav__link')].map((one) =>
        (one.textContent ?? '').trim(),
      ),
      rows: [...document.querySelectorAll<HTMLElement>('[role="menuitem"]')],
    };
  }

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'restaurantes', children: [] },
          { path: 'tiendas', children: [] },
          { path: 'riders', children: [] },
        ]),
      ],
    });
  });

  it('offers the phone exactly the sections the wide bar lists', async () => {
    const { labels, rows } = await open();

    expect(labels.length).toBe(3);
    expect(rows.map((row) => (row.textContent ?? '').trim())).toEqual([...labels]);
  });

  it('reaches a section from a row, which is dispatched on the label alone', async () => {
    const { fixture, labels, rows } = await open();
    const wanted = rows.find((row) => (row.textContent ?? '').trim() === labels[1]);

    expect(wanted).toBeDefined();
    wanted?.click();
    await fixture.whenStable();

    expect(TestBed.inject(Router).url).toBe('/tiendas');
  });
});
