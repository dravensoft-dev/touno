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
import { Marketplace } from '../../../domain/marketplace';
import { MerchantCard } from '../../../shared/merchant-card/merchant-card';
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
    StructuredData,
  ],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  private readonly router = inject(Router);

  protected readonly marketplace = inject(Marketplace);

  protected readonly restaurants = computed(() => this.marketplace.restaurants().slice(0, 4));

  protected readonly importers = computed(() => this.marketplace.importers().slice(0, 4));

  protected readonly cities = computed(() => this.marketplace.cities());

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

  protected goTo(path: string): void {
    void this.router.navigateByUrl(path);
  }
}
