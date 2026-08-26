import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StreetSegment } from '../../domain/tracking.model';
import { NearbyMap, NearbyPlace } from './nearby-map';

const PLACES: readonly NearbyPlace[] = [
  { id: 'lc-1', label: 'Copacabana Miraflores', point: { x: 44, y: 38 }, cuposLeft: 2 },
  { id: 'lc-2', label: 'Illimani San Miguel', point: { x: 72, y: 66 }, cuposLeft: 1 },
];

const STREETS: readonly StreetSegment[] = [
  { from: { x: 0, y: 40 }, to: { x: 100, y: 40 }, rank: 'avenida' },
];

function render(inputs: Record<string, unknown> = {}): ComponentFixture<NearbyMap> {
  TestBed.configureTestingModule({});

  const fixture = TestBed.createComponent(NearbyMap);

  fixture.componentRef.setInput('label', 'Sucursales que buscan agentes libres');
  fixture.componentRef.setInput('here', { x: 40, y: 40 });
  fixture.componentRef.setInput('places', PLACES);
  fixture.componentRef.setInput('streets', STREETS);

  for (const [key, value] of Object.entries(inputs)) {
    fixture.componentRef.setInput(key, value);
  }

  fixture.detectChanges();

  return fixture;
}

describe('NearbyMap', () => {
  it('draws one pin per sucursal and one mark for the rider himself', () => {
    const element: HTMLElement = render().nativeElement;

    expect(element.querySelectorAll('.nearby__pin').length).toBe(2);
    expect(element.querySelectorAll('.nearby__here').length).toBe(1);
  });

  it('says in words what the shapes say, because the drawing is not its own text', () => {
    const caption = render().nativeElement.querySelector('figcaption')?.textContent ?? '';

    expect(caption).toContain('2');
    expect(caption).toContain('Copacabana Miraflores');
  });

  it('names the nearest sucursal, and not the first one it was handed', () => {
    const caption =
      render({
        places: [
          { id: 'lc-2', label: 'Lejos', point: { x: 95, y: 95 }, cuposLeft: 1 },
          { id: 'lc-1', label: 'Cerca', point: { x: 42, y: 41 }, cuposLeft: 3 },
        ],
      }).nativeElement.querySelector('figcaption')?.textContent ?? '';

    expect(caption).toContain('Cerca');
    expect(caption).not.toContain('Lejos');
  });

  it('says there is nothing near rather than drawing an empty map', () => {
    const caption =
      render({ places: [] }).nativeElement.querySelector('figcaption')?.textContent ?? '';

    expect(caption.length).toBeGreaterThan(0);
    expect(caption.toLowerCase()).toContain('ninguna');
  });

  it('measures nothing in kilometres, because a point here is a place on the plane', () => {
    const caption = render().nativeElement.querySelector('figcaption')?.textContent ?? '';

    expect(caption).not.toContain('km');
  });

  it('draws every stroke so it can read a border token, and never tints by attribute', () => {
    const element: HTMLElement = render().nativeElement;

    for (const shape of element.querySelectorAll('svg *')) {
      expect(shape.getAttribute('fill')).toBeNull();
      expect(shape.getAttribute('stroke')).toBeNull();
    }

    for (const stroked of element.querySelectorAll('.nearby__street, .nearby__here')) {
      expect(stroked.getAttribute('vector-effect')).toBe('non-scaling-stroke');
    }
  });
});
