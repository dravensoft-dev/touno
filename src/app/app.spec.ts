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

  it('draws both brand branches, so the markup never depends on the width', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const host: HTMLElement = fixture.nativeElement;
    const brand = host.querySelector('a.shell-brand');

    expect(brand?.getAttribute('aria-label')).toBe('Touno, inicio');
    expect(brand?.querySelector('.shell-brand__narrow app-brand-mark')).not.toBeNull();
    expect(brand?.querySelector('.shell-brand__wide arena-app-logo app-brand-mark')).not.toBeNull();
  });

  it('leaves the app bar in place on the first render, which is what the prerender wrote', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const host: HTMLElement = fixture.nativeElement;

    expect(host.classList.contains('shell-bar-away')).toBe(false);
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

    expect(rail).toEqual(['/feed', '/carrito', '/mis-pedidos', '/manual/comprador']);
    expect(bar).toEqual(['/feed', '/carrito', '/mis-pedidos']);
  });

  it('carries the base href into every destination when the site is served from a subpath', async () => {
    const [rail, bar] = await railAndBarUnder('/touno/');

    expect(rail).toEqual([
      '/touno/feed',
      '/touno/carrito',
      '/touno/mis-pedidos',
      '/touno/manual/comprador',
    ]);
    expect(bar).toEqual(['/touno/feed', '/touno/carrito', '/touno/mis-pedidos']);
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

describe('App signed in', () => {
  async function shellAs(profileId: string, path: string): Promise<ComponentFixture<App>> {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: '', children: [] },
          { path: 'feed', children: [] },
          { path: 'restaurantes', children: [] },
          { path: 'mis-pedidos', children: [] },
          { path: 'manual/:rol', children: [] },
        ]),
        { provide: APP_BASE_HREF, useValue: '/' },
      ],
    });

    const fixture = TestBed.createComponent(App);

    TestBed.inject(Session).enter(profileId);
    fixture.detectChanges();
    await TestBed.inject(Router).navigateByUrl(path);
    fixture.detectChanges();

    return fixture;
  }

  it('takes the app bar away, because the rail carries the brand instead', async () => {
    const fixture = await shellAs('p-comprador', '/feed');
    const host: HTMLElement = fixture.nativeElement;

    expect(host.querySelector('arena-app-bar')).toBeNull();
    expect(host.querySelector('.shell-rail-brand arena-app-logo')).not.toBeNull();
    expect(host.classList.contains('shell-signed-in')).toBe(true);
  });

  it('leaves the app bar to whoever is signed out, which is what the prerender writes', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const host: HTMLElement = fixture.nativeElement;

    expect(host.querySelector('arena-app-bar')).not.toBeNull();
    expect(host.querySelector('.shell-rail-brand')).toBeNull();
    expect(host.classList.contains('shell-signed-in')).toBe(false);
  });

  it('carries the rail into a public route, so the marketplace never strands a reader', async () => {
    const fixture = await shellAs('p-comprador', '/restaurantes');
    const rail = [...fixture.nativeElement.querySelectorAll('arena-side-nav a')].map(
      (one: Element) => one.getAttribute('href'),
    );

    expect(rail).toContain('/feed');
    expect(rail).toContain('/mis-pedidos');
  });

  it('keeps the gate on another role panel, which the rail must never open', async () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'empresa/sucursales', children: [] }]),
        { provide: APP_BASE_HREF, useValue: '/' },
      ],
    });

    const fixture = TestBed.createComponent(App);
    TestBed.inject(Session).enter('p-comprador');
    fixture.detectChanges();
    await TestBed.inject(Router).navigateByUrl('/empresa/sucursales');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('arena-unauth-card')).not.toBeNull();
  });
});

describe('App bottom bar Más', () => {
  async function barOf(profileId: string, path: string): Promise<ComponentFixture<App>> {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'feed', children: [] },
          { path: 'mis-pedidos', children: [] },
          { path: 'rider/turno', children: [] },
          { path: 'rider/ganancias', children: [] },
          { path: 'manual/:rol', children: [] },
        ]),
        { provide: APP_BASE_HREF, useValue: '/' },
      ],
    });

    const fixture = TestBed.createComponent(App);

    TestBed.inject(Session).enter(profileId);
    fixture.detectChanges();
    await TestBed.inject(Router).navigateByUrl(path);
    fixture.detectChanges();

    return fixture;
  }

  function labelsIn(host: HTMLElement, selector: string): readonly string[] {
    return [...host.querySelectorAll(selector)].map((one) => (one.textContent ?? '').trim());
  }

  it('gives the bar a fourth column that is a button and never a link', async () => {
    const fixture = await barOf('p-comprador', '/feed');
    const host: HTMLElement = fixture.nativeElement;
    const items = labelsIn(host, 'arena-bottom-nav-item');

    expect(items.length).toBe(4);
    expect(items[3]).toBe('Más');
    expect(host.querySelectorAll('arena-bottom-nav a').length).toBe(3);
    expect(host.querySelector('arena-bottom-nav button')).not.toBeNull();
  });

  it('keeps the sheet closed until Más is pressed, and opens it with what the bar cannot hold', async () => {
    const fixture = await barOf('p-rider', '/rider/turno');
    const host: HTMLElement = fixture.nativeElement;

    expect(host.querySelector('arena-sheet arena-side-nav-item')).toBeNull();

    host.querySelector<HTMLButtonElement>('arena-bottom-nav button')?.click();
    fixture.detectChanges();

    const inSheet = labelsIn(host, 'arena-sheet arena-side-nav-item');

    expect(inSheet).toEqual(['Ganancias', 'Manual']);
  });

  it('offers the tema and the salida there, which the app bar used to carry', async () => {
    const fixture = await barOf('p-rider', '/rider/turno');
    const host: HTMLElement = fixture.nativeElement;

    host.querySelector<HTMLButtonElement>('arena-bottom-nav button')?.click();
    fixture.detectChanges();

    expect(host.querySelector('arena-sheet app-theme-toggle')).not.toBeNull();
    expect(host.querySelector('arena-sheet [footer]')?.textContent).toContain('Marco Quispe');
  });

  it('lights Más when the reader is on a destination the sheet holds', async () => {
    const fixture = await barOf('p-rider', '/rider/ganancias');
    const host: HTMLElement = fixture.nativeElement;
    const current = host.querySelector('arena-bottom-nav [aria-current="page"]');

    expect((current?.textContent ?? '').trim()).toBe('Más');
  });
});
