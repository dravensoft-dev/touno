import { TestBed } from '@angular/core/testing';
import { Businesses } from './businesses';
import { Catalog } from './catalog';
import { BusinessType } from './businesses.model';

describe('Catalog', () => {
  let catalog: Catalog;
  let businesses: Businesses;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    catalog = TestBed.inject(Catalog);
    businesses = TestBed.inject(Businesses);
  });

  it('hangs every product off an empresa that exists', () => {
    expect(catalog.products().length).toBeGreaterThan(0);

    for (const product of catalog.products()) {
      expect(businesses.companyById(product.companyId)).toBeDefined();
    }
  });

  it('gives every empresa something to sell', () => {
    for (const company of businesses.companies()) {
      expect(catalog.ofCompany(company.id).length).toBeGreaterThan(0);
    }
  });

  it('treats a product as available until a sucursal says otherwise', () => {
    const off = catalog.stock()[0];

    expect(catalog.isAvailable(off.branchId, off.productId)).toBe(false);
    expect(catalog.isAvailable(off.branchId, 'pc-combo-familiar')).toBe(true);
  });

  it('lets one sucursal disable an article without touching its siblings', () => {
    const branch = businesses.branchById('b-ale-la-paz');
    const sibling = businesses.branchById('b-ale-santa-cruz');

    catalog.setAvailability(branch?.id ?? '', 'al-jean', false);

    expect(catalog.isAvailable(branch?.id ?? '', 'al-jean')).toBe(false);
    expect(catalog.isAvailable(sibling?.id ?? '', 'al-jean')).toBe(true);

    catalog.setAvailability(branch?.id ?? '', 'al-jean', true);

    expect(catalog.isAvailable(branch?.id ?? '', 'al-jean')).toBe(true);
  });

  it('never lets an override outlive being turned back on', () => {
    const before = catalog.stock().length;

    catalog.setAvailability('b-ale-la-paz', 'al-gorra', false);
    catalog.setAvailability('b-ale-la-paz', 'al-gorra', true);

    expect(catalog.stock().length).toBe(before);
  });

  for (const type of ['restaurante', 'importadora'] as BusinessType[]) {
    it(`feeds ${type} products a buyer can order from an open sucursal`, () => {
      const feed = catalog.feedOf(type);

      expect(feed.length).toBeGreaterThan(0);

      for (const item of feed) {
        expect(item.branch.open).toBe(true);
        expect(item.company.type).toBe(type);
        expect(item.product.companyId).toBe(item.company.id);
        expect(catalog.isAvailable(item.branch.id, item.product.id)).toBe(true);
      }
    });

    it(`opens the ${type} feed with one product per sucursal`, () => {
      const feed = catalog.feedOf(type);
      const first = feed.slice(0, catalog.sellingBranches(type).length).map((one) => one.branch.id);

      expect(new Set(first).size).toBe(first.length);
    });

    it(`leads each ${type} sucursal with its featured best seller`, () => {
      for (const branch of catalog.sellingBranches(type)) {
        const own = catalog
          .feedOf(type)
          .filter((item) => item.branch.id === branch.id)
          .map((item) => item.product);
        const best = [...own].sort(
          (left, right) =>
            Number(right.featured) - Number(left.featured) ||
            right.soldThisMonth - left.soldThisMonth,
        );

        expect(own).toEqual(best);
      }
    });
  }

  it('narrows the feed to one city, which is what the same-city rule needs', () => {
    const feed = catalog.feedOf('restaurante', 'la-paz');

    expect(feed.length).toBeGreaterThan(0);

    for (const item of feed) {
      expect(item.branch.cityId).toBe('la-paz');
    }
  });

  it('leaves a closed sucursal out of the feed entirely', () => {
    const closed = businesses.branches().find((one) => !one.open);
    const shown = catalog.feedOf('restaurante').map((one) => one.branch.id);

    expect(closed).toBeDefined();
    expect(shown).not.toContain(closed?.id);
  });
});
