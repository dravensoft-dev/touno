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
import { Cart } from '../../../domain/cart';
import { Notices } from '../../../layout/notices';
import { Marketplace } from '../../../domain/marketplace';
import { Product } from '../../../domain/marketplace.model';
import { MerchantCard } from '../../../shared/merchant-card/merchant-card';
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
    MerchantCard,
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

  protected readonly marketplace = inject(Marketplace);

  protected readonly restaurants = computed(() => this.marketplace.restaurants().slice(0, 4));

  protected readonly importers = computed(() => this.marketplace.importers().slice(0, 4));

  protected readonly cities = computed(() => this.marketplace.cities());

  protected readonly foodPicks = computed(() => this.marketplace.foodFeed().slice(0, 4));

  protected readonly parcelPicks = computed(() => this.marketplace.parcelFeed().slice(0, 4));

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
        name: `${item.product.name} · ${item.merchant.name}`,
        url: `${SITE_ORIGIN}/${item.merchant.kind === 'restaurante' ? 'restaurantes' : 'tiendas'}/${item.merchant.slug}`,
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

  protected addToCart(product: Product): void {
    this.cart.add(product);
    this.notices.addedToCart(product.name);
  }

  protected goTo(path: string): void {
    void this.router.navigateByUrl(path);
  }
}
