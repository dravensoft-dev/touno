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

  it('finds a city by id and by slug, and answers its name', () => {
    expect(geography.byId('la-paz')?.name).toBe('La Paz');
    expect(geography.bySlug('santa-cruz')?.id).toBe('santa-cruz');
    expect(geography.nameOf('cochabamba')).toBe('Cochabamba');
  });

  it('answers an empty name rather than throwing for a city that is not there', () => {
    expect(geography.nameOf('potosi')).toBe('');
  });
});
