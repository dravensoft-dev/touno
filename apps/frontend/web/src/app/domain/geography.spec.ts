import { TestBed } from '@angular/core/testing';
import { Geography } from './geography';

describe('Geography', () => {
  let geography: Geography;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    geography = TestBed.inject(Geography);
  });

  it('carries every city a branch or a buyer can sit in', () => {
    expect(geography.all().length).toBeGreaterThan(0);
  });

  it('keeps ids and slugs unique and lowercase', () => {
    const ids = geography.all().map((one) => one.id);
    const slugs = geography.all().map((one) => one.slug);

    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(slugs).size).toBe(slugs.length);

    for (const city of geography.all()) {
      expect(city.slug).toBe(city.slug.toLowerCase());
      expect(city.zones.length).toBeGreaterThan(0);
    }
  });

  it('gives every zone a point in its city plane, so a distance is computable', () => {
    for (const city of geography.all()) {
      for (const zone of city.zones) {
        expect(zone.name.length).toBeGreaterThan(0);
        expect(Number.isFinite(zone.point.x)).toBe(true);
        expect(Number.isFinite(zone.point.y)).toBe(true);
      }
    }
  });

  it('finds a zone by name and answers undefined for one that is not there', () => {
    expect(geography.zoneOf('la-paz', 'Miraflores')?.point.x).toBeGreaterThan(0);
    expect(geography.zoneOf('la-paz', 'Equipetrol')).toBeUndefined();
  });

  it('starts with one city under weather the rider is paid extra for', () => {
    expect(geography.all().some((one) => one.weather === 'adverso')).toBe(true);
  });

  it('turns a city weather on and off, which is what makes the fee walkable', () => {
    geography.setWeather('la-paz', 'adverso');
    expect(geography.isAdverse('la-paz')).toBe(true);

    geography.setWeather('la-paz', 'normal');
    expect(geography.isAdverse('la-paz')).toBe(false);
  });

  it('answers normal rather than throwing for a city that is not there', () => {
    expect(geography.weatherOf('potosi')).toBe('normal');
  });

  it('finds a city by id and by slug, and answers its name', () => {
    expect(geography.byId('la-paz')?.name).toBe('La Paz');
    expect(geography.bySlug('santa-cruz')?.id).toBe('santa-cruz');
    expect(geography.nameOf('cochabamba')).toBe('Cochabamba');
  });

  it('answers an empty name rather than throwing for a city that is not there', () => {
    expect(geography.nameOf('potosi')).toBe('');
  });
});
