import { TestBed } from '@angular/core/testing';
import { Geography } from './geography';
import { Riders } from './riders';
import { Vehicle, rangeOf, vehicleIcon, vehicleLabel } from './riders.model';
import { RIDERS } from './riders.data';

describe('Riders', () => {
  let riders: Riders;
  let geography: Geography;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    riders = TestBed.inject(Riders);
    geography = TestBed.inject(Geography);
  });

  it('lets the vehicle decide the range, and nothing else', () => {
    expect(rangeOf('moto')).toBe('urbano');
    expect(rangeOf('auto')).toBe('urbano');
    expect(rangeOf('camion')).toBe('interurbano');
  });

  it('carries riders of both ranges, so both kinds of work are reachable', () => {
    expect(riders.ofRange('urbano').length).toBeGreaterThan(0);
    expect(riders.ofRange('interurbano').length).toBeGreaterThan(0);
  });

  it('keeps ids, slugs and plates unique', () => {
    for (const key of ['id', 'slug', 'plate'] as const) {
      const values = riders.all().map((one) => one[key]);

      expect(new Set(values).size).toBe(values.length);
    }
  });

  it('seats every rider in a city the tree knows, with a zone to work', () => {
    for (const rider of riders.all()) {
      expect(geography.byId(rider.cityId)).toBeDefined();
      expect(rider.zones.length).toBeGreaterThan(0);
    }
  });

  it('names and draws every vehicle', () => {
    for (const vehicle of ['moto', 'auto', 'camion'] as Vehicle[]) {
      expect(vehicleLabel(vehicle)).not.toBe('');
      expect(vehicleIcon(vehicle)).toContain('ph-bold ph-');
    }
  });

  it('finds a rider by id and by slug, and answers a name for a stranger', () => {
    const rider = riders.all()[0];

    expect(riders.bySlug(rider.slug)?.id).toBe(rider.id);
    expect(riders.nameOf(rider.id)).toBe(rider.name);
    expect(riders.nameOf('r-no-existe')).toBe('');
    expect(riders.rangeOfRider('r-no-existe')).toBeUndefined();
  });

  it('searches by name and by zone, inside one city', () => {
    expect(riders.search('marco').map((one) => one.id)).toContain('r-marco');
    expect(riders.search('miraflores').map((one) => one.id)).toContain('r-marco');
    expect(riders.search('', 'santa-cruz').every((one) => one.cityId === 'santa-cruz')).toBe(true);
  });

  it('turns one rider online without touching the rest', () => {
    const rider = riders.all().find((one) => !one.online);
    const others = riders
      .all()
      .filter((one) => one.id !== rider?.id)
      .map((one) => one.online);

    riders.setOnline(rider?.id ?? '', true);

    expect(riders.byId(rider?.id ?? '')?.online).toBe(true);
    expect(
      riders
        .all()
        .filter((one) => one.id !== rider?.id)
        .map((one) => one.online),
    ).toEqual(others);
  });

  it('adds up the week from the payouts it holds', () => {
    expect(riders.weekTrips()).toBe(riders.payouts.reduce((sum, one) => sum + one.trips, 0));
    expect(riders.weekEarnings()).toBeGreaterThan(0);
  });

  it('holds the free agent switch on the rider, so it outlives one llamado', () => {
    const riders = TestBed.inject(Riders);

    expect(riders.byId('r-diego')?.freeAgent).toBe(true);

    riders.setFreeAgent('r-diego', false);

    expect(riders.byId('r-diego')?.freeAgent).toBe(false);
  });

  it('leaves the switch off for a rider who works under a reclutamiento', () => {
    expect(RIDERS.find((one) => one.id === 'r-marco')?.freeAgent).toBe(false);
  });
});
