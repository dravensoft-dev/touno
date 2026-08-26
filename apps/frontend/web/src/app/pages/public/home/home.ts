import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  ArenaAction,
  ArenaActions,
  ArenaButton,
  ArenaCard,
  ArenaGrid,
  ArenaHero,
  ArenaScroller,
  ArenaScrollerItem,
  ArenaSection,
  ArenaStatCard,
} from '@dravensoft/arena-angular';
import { Businesses } from '../../../domain/businesses';
import { Catalog } from '../../../domain/catalog';
import { Geography } from '../../../domain/geography';
import { Riders } from '../../../domain/riders';
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
    ArenaAction,
    ArenaActions,
    ArenaButton,
    ArenaCard,
    ArenaSection,
    ArenaGrid,
    ArenaStatCard,
    ArenaScroller,
    ArenaScrollerItem,
    StructuredData,
  ],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly businesses = inject(Businesses);
  private readonly catalog = inject(Catalog);
  private readonly riders = inject(Riders);

  protected readonly geography = inject(Geography);

  protected readonly cities = computed(() => this.geography.all());

  protected readonly restaurants = computed(
    () => this.catalog.sellingBranches('restaurante').length,
  );

  protected readonly importers = computed(() => this.catalog.sellingBranches('importadora').length);

  protected readonly brands = computed(() => this.businesses.companies().length);

  protected readonly fleet = computed(() => this.riders.all().length);

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

  protected href(path: string): string {
    return this.location.prepareExternalUrl(path);
  }

  protected goTo(path: string): void {
    void this.router.navigateByUrl(path);
  }
}
