import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GeoPoint } from '../../domain/geography.model';
import { StreetSegment } from '../../domain/tracking.model';
import { RouteMap } from './route-map';

const ROUTE: readonly GeoPoint[] = [
  { x: 30, y: 40 },
  { x: 40, y: 40 },
  { x: 40, y: 60 },
  { x: 55, y: 60 },
];

const STREETS: readonly StreetSegment[] = [
  { from: { x: 0, y: 40 }, to: { x: 100, y: 40 }, rank: 'avenida' },
  { from: { x: 40, y: 0 }, to: { x: 40, y: 100 }, rank: 'calle' },
];

function render(inputs: Record<string, unknown> = {}): ComponentFixture<RouteMap> {
  TestBed.configureTestingModule({});

  const fixture = TestBed.createComponent(RouteMap);

  fixture.componentRef.setInput('label', 'Recorrido del rider');
  fixture.componentRef.setInput('origin', ROUTE[0]);
  fixture.componentRef.setInput('destination', ROUTE[ROUTE.length - 1]);
  fixture.componentRef.setInput('route', ROUTE);
  fixture.componentRef.setInput('streets', STREETS);

  for (const [key, value] of Object.entries(inputs)) {
    fixture.componentRef.setInput(key, value);
  }

  fixture.detectChanges();

  return fixture;
}

function host(fixture: ComponentFixture<RouteMap>): HTMLElement {
  return fixture.nativeElement;
}

describe('RouteMap', () => {
  it('draws the streets and the route from the points it is given', () => {
    const element = host(render());

    expect(element.querySelectorAll('.map__street').length).toBe(STREETS.length);
    expect(element.querySelector('.map__route')?.getAttribute('points')).toBe(
      '30,40 40,40 40,60 55,60',
    );
  });

  it('names itself for a reader who cannot see it', () => {
    const svg = host(render()).querySelector('svg');

    expect(svg?.getAttribute('role')).toBe('img');
    expect(svg?.getAttribute('aria-label')).toBe('Recorrido del rider');
  });

  it('keeps every stroke off the scale, so its width stays a token', () => {
    const element = host(render({ rider: { x: 40, y: 40 } }));

    for (const shape of element.querySelectorAll('svg *')) {
      expect(shape.getAttribute('vector-effect')).toBe('non-scaling-stroke');
    }
  });

  it('frames every point it draws, with room around them', () => {
    const box = host(render()).querySelector('svg')?.getAttribute('viewBox') ?? '';
    const [x, y, width, height] = box.split(' ').map(Number);

    expect(x).toBeLessThan(30);
    expect(y).toBeLessThan(40);
    expect(x + width).toBeGreaterThan(55);
    expect(y + height).toBeGreaterThan(60);
    expect(width / height).toBeCloseTo(1.5, 2);
  });

  it('draws no rider until there is one to draw', () => {
    const element = host(render());

    expect(element.querySelector('.map__rider')).toBeNull();
    expect(element.querySelector('.map__lost')).toBeNull();
  });

  it('draws the rider where he last reported', () => {
    const element = host(render({ rider: { x: 40, y: 60 } }));
    const dot = element.querySelector('.map__rider');

    expect(dot?.getAttribute('cx')).toBe('40');
    expect(dot?.getAttribute('cy')).toBe('60');
    expect(element.querySelector('.map__lost')).toBeNull();
  });

  it('says the connection was lost, with the hour, and stops drawing him as moving', () => {
    const element = host(
      render({ rider: { x: 40, y: 60 }, stale: true, lastSeenAt: '2026-08-15T13:08:00' }),
    );

    expect(element.querySelector('.map__rider')).toBeNull();
    expect(element.querySelector('.map__lost')).not.toBeNull();
    expect(element.textContent).toContain('Última conexión registrada');
    expect(element.textContent).toContain('13:08');
  });

  it('says nothing about a lost connection while the rider is reporting', () => {
    const element = host(render({ rider: { x: 40, y: 60 } }));

    expect(element.textContent).not.toContain('Última conexión registrada');
  });

  it('writes in words what it draws in the picture', () => {
    const caption = host(
      render({ rider: { x: 40, y: 40 }, riderLabel: 'Marco Quispe' }),
    ).querySelector('figcaption');

    expect(caption?.textContent).toContain('Marco Quispe');
    expect(caption?.textContent).toContain('en camino');
  });

  it('says in words that the rider went quiet, not only in the drawing', () => {
    const caption = host(
      render({ rider: { x: 40, y: 40 }, riderLabel: 'Marco Quispe', stale: true }),
    ).querySelector('figcaption');

    expect(caption?.textContent).toContain('dejó de enviar');
  });
});
