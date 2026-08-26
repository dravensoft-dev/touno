import { TestBed } from '@angular/core/testing';
import { Businesses } from './businesses';
import { Geography } from './geography';
import { BusinessType } from './businesses.model';

describe('Businesses', () => {
  let businesses: Businesses;
  let geography: Geography;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    businesses = TestBed.inject(Businesses);
    geography = TestBed.inject(Geography);
  });

  it('gives every empresa at least one sucursal', () => {
    expect(businesses.companies().length).toBeGreaterThan(0);

    for (const company of businesses.companies()) {
      expect(businesses.branchesOf(company.id).length).toBeGreaterThan(0);
    }
  });

  it('keeps a sucursal slug unique inside its empresa and lowercase', () => {
    for (const company of businesses.companies()) {
      const slugs = businesses.branchesOf(company.id).map((one) => one.slug);

      expect(new Set(slugs).size).toBe(slugs.length);

      for (const slug of slugs) {
        expect(slug).toBe(slug.toLowerCase());
      }
    }
  });

  it('seats every sucursal in a city the tree knows', () => {
    for (const branch of businesses.branches()) {
      expect(geography.byId(branch.cityId)).toBeDefined();
      expect(businesses.companyById(branch.companyId)).toBeDefined();
    }
  });

  it('lets an importadora reach more than one city, which is what interurban delivery needs', () => {
    const reaching = businesses
      .companiesOfType('importadora')
      .filter((one) => businesses.citiesOf(one.id).length > 1);

    expect(reaching.length).toBeGreaterThan(0);
  });

  it('finds a sucursal from the pair of slugs a public URL carries', () => {
    for (const branch of businesses.branches()) {
      const company = businesses.companyById(branch.companyId);
      const found = businesses.bySlugPair(company?.slug ?? '', branch.slug);

      expect(found?.id).toBe(branch.id);
    }
  });

  it('answers nothing rather than throwing for an empresa that is not there', () => {
    expect(businesses.bySlugPair('no-existe', 'la-paz')).toBeUndefined();
    expect(businesses.cityOf('b-no-existe')).toBe('');
  });

  it('reports whether an empresa runs a sucursal in a city', () => {
    const company = businesses.companyBySlug('importadora-ale');
    const city = businesses.branchesOf(company?.id ?? '')[0].cityId;

    expect(businesses.hasBranchIn(company?.id ?? '', city)).toBe(true);
    expect(businesses.branchOfIn(company?.id ?? '', city)?.cityId).toBe(city);
  });

  it('keeps both business types in play', () => {
    for (const type of ['restaurante', 'importadora'] as BusinessType[]) {
      expect(businesses.companiesOfType(type).length).toBeGreaterThan(0);
    }
  });

  it('opens and closes one sucursal without touching its siblings', () => {
    const branch = businesses.branches().find((one) => one.open);
    const siblings = businesses
      .branchesOf(branch?.companyId ?? '')
      .filter((one) => one.id !== branch?.id)
      .map((one) => one.open);

    businesses.setOpen(branch?.id ?? '', false);

    expect(businesses.branchById(branch?.id ?? '')?.open).toBe(false);
    expect(
      businesses
        .branchesOf(branch?.companyId ?? '')
        .filter((one) => one.id !== branch?.id)
        .map((one) => one.open),
    ).toEqual(siblings);
  });
});
