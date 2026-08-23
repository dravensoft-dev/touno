import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  ArenaActions,
  ArenaButton,
  ArenaGrid,
  ArenaHero,
  ArenaScroller,
  ArenaScrollerItem,
  ArenaSection,
  ArenaStatCard,
} from '@dravensoft/arena-angular';
import { Businesses } from '../../../domain/businesses';
import { pathOfType } from '../../../domain/businesses.model';
import { Cart } from '../../../domain/cart';
import { Catalog } from '../../../domain/catalog';
import { Reputation } from '../../../domain/reputation';
import { FeedItem } from '../../../domain/catalog.model';
import { Geography } from '../../../domain/geography';
import { Notices } from '../../../layout/notices';
import { BranchCard } from '../../../shared/branch-card/branch-card';
import { ProductCard } from '../../../shared/product-card/product-card';
import { StructuredData } from '../../../seo/structured-data';
import {
  CONTACT_CITY,
  CONTACT_COUNTRY,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_ORIGIN,
} from '../../../seo/site';

@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [
    ArenaHero,
    ArenaActions,
    ArenaButton,
    ArenaSection,
    ArenaGrid,
    ArenaStatCard,
    ArenaScroller,
    ArenaScrollerItem,
    BranchCard,
    ProductCard,
    StructuredData,
  ],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  private readonly router = inject(Router);
  private readonly cart = inject(Cart);
  private readonly notices = inject(Notices);

  protected readonly businesses = inject(Businesses);
  protected readonly catalog = inject(Catalog);
  private readonly reputation = inject(Reputation);
  protected readonly geography = inject(Geography);

  protected readonly restaurants = computed(() =>
    this.reputation.bestFirst(this.catalog.sellingBranches('restaurante')).slice(0, 4),
  );

  protected readonly importers = computed(() =>
    this.reputation.bestFirst(this.catalog.sellingBranches('importadora')).slice(0, 4),
  );

  protected readonly cities = computed(() => this.geography.all());

  protected readonly foodPicks = computed(() => this.catalog.foodFeed().slice(0, 4));

  protected readonly parcelPicks = computed(() => this.catalog.parcelFeed().slice(0, 4));

  protected readonly feedSchema = computed<Record<string, unknown>>(() => {
    const items = [...this.foodPicks(), ...this.parcelPicks()];

    return {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Lo que se está vendiendo hoy en Touno',
      numberOfItems: items.length,
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: `${item.product.name} · ${item.branch.name}`,
        url: `${SITE_ORIGIN}/${pathOfType(item.company.type)}/${item.company.slug}/${item.branch.slug}`,
      })),
    };
  });

  protected readonly websiteSchema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_ORIGIN}/#website`,
    name: SITE_NAME,
    url: SITE_ORIGIN,
    description: SITE_DESCRIPTION,
    inLanguage: 'es-BO',
  };

  protected readonly businessSchema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_ORIGIN}/#organization`,
    name: SITE_NAME,
    url: SITE_ORIGIN,
    description: SITE_DESCRIPTION,
    areaServed: { '@type': 'Country', name: CONTACT_COUNTRY },
    address: { '@type': 'PostalAddress', addressLocality: CONTACT_CITY, addressCountry: 'BO' },
  };

  protected companyOf(branchId: string) {
    return this.businesses.companyOfBranch(branchId);
  }

  protected addToCart(item: FeedItem): void {
    this.cart.add(item.product, item.branch.id);
    this.notices.addedToCart(item.product.name);
  }

  protected goTo(path: string): void {
    void this.router.navigateByUrl(path);
  }
}
