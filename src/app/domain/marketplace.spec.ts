import { TestBed } from '@angular/core/testing';
import { Marketplace } from './marketplace';
import { FeedItem, MerchantKind } from './marketplace.model';

describe('Marketplace', () => {
  let marketplace: Marketplace;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    marketplace = TestBed.inject(Marketplace);
  });

  function openMerchantsOf(kind: MerchantKind): number {
    return marketplace.byKind(kind).filter((one) => one.open).length;
  }

  function feedOf(kind: MerchantKind): readonly FeedItem[] {
    return kind === 'restaurante' ? marketplace.foodFeed() : marketplace.parcelFeed();
  }

  for (const kind of ['restaurante', 'importadora'] as const) {
    it(`feeds ${kind} products a buyer can order right now`, () => {
      const feed = feedOf(kind);

      expect(feed.length).toBeGreaterThan(0);

      for (const item of feed) {
        expect(item.merchant.kind).toBe(kind);
        expect(item.merchant.open).toBe(true);
        expect(item.product.available).toBe(true);
        expect(item.product.merchantSlug).toBe(item.merchant.slug);
      }
    });

    it(`carries every ${kind} product on offer exactly once`, () => {
      const feed = feedOf(kind);
      const ids = feed.map((item) => item.product.id);
      const expected = marketplace
        .byKind(kind)
        .filter((one) => one.open)
        .flatMap((one) => marketplace.catalogOf(one.slug))
        .filter((one) => one.available);

      expect(new Set(ids).size).toBe(ids.length);
      expect(ids.length).toBe(expected.length);
    });

    it(`opens the ${kind} feed with one product per merchant`, () => {
      const feed = feedOf(kind);
      const round = feed.slice(0, openMerchantsOf(kind)).map((item) => item.merchant.slug);

      expect(new Set(round).size).toBe(round.length);
    });

    it(`leads each ${kind} merchant with its featured best seller`, () => {
      for (const merchant of marketplace.byKind(kind).filter((one) => one.open)) {
        const own = feedOf(kind)
          .filter((item) => item.merchant.slug === merchant.slug)
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
});
