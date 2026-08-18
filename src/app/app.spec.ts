import { APP_BASE_HREF } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { ARENA_MAIN_ID } from '@dravensoft/arena-angular';
import { App } from './app';

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
