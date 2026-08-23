import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import {
  ArenaAlert,
  ArenaBreadcrumbs,
  ArenaCrumb,
  ArenaGrid,
  ArenaKeyValue,
  ArenaKeyValueRow,
  ArenaPageHead,
  ArenaSection,
} from '@dravensoft/arena-angular';
import { ArenaMetadataService } from '@dravensoft/arena-angular/metadata';
import { Businesses } from '../../../domain/businesses';
import { Catalog } from '../../../domain/catalog';
import { Reputation } from '../../../domain/reputation';
import { porcentaje } from '../../../domain/format';
import { Geography } from '../../../domain/geography';
import { BusinessType, pathOfType } from '../../../domain/businesses.model';
import { bs } from '../../../domain/format';
import { BranchCard } from '../../../shared/branch-card/branch-card';
import { StructuredData } from '../../../seo/structured-data';
import { PRICE_CURRENCY, SITE_ORIGIN } from '../../../seo/site';

@Component({
  selector: 'app-company-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [
    ArenaBreadcrumbs,
    ArenaPageHead,
    ArenaSection,
    ArenaGrid,
    ArenaKeyValue,
    ArenaAlert,
    BranchCard,
    StructuredData,
  ],
  templateUrl: './company.html',
})
export class CompanyDetail {
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly metadata = inject(ArenaMetadataService);
  private readonly catalog = inject(Catalog);
  private readonly reputation = inject(Reputation);

  protected readonly businesses = inject(Businesses);
  protected readonly geography = inject(Geography);

  readonly empresa = input('');
  readonly type = input.required<BusinessType>();

  protected readonly company = computed(() => {
    const company = this.businesses.companyBySlug(this.empresa());

    if (!company) {
      throw new Error(`Unknown company: ${this.empresa()}`);
    }

    return company;
  });

  protected readonly segment = computed(() => pathOfType(this.type()));

  protected readonly path = computed(() => `/${this.segment()}/${this.empresa()}`);

  protected readonly branches = computed(() => this.businesses.branchesOf(this.company().id));

  protected readonly cities = computed(() =>
    this.businesses.citiesOf(this.company().id).map((one) => this.geography.nameOf(one)),
  );

  protected readonly restaurant = computed(() => this.type() === 'restaurante');

  protected readonly products = computed(() => this.catalog.ofCompany(this.company().id));

  protected readonly crumbs = computed<readonly ArenaCrumb[]>(() => [
    { label: 'Inicio', href: this.location.prepareExternalUrl('/') },
    {
      label: this.restaurant() ? 'Restaurantes' : 'Importadoras',
      href: this.location.prepareExternalUrl(`/${this.segment()}`),
    },
    { label: this.company().name },
  ]);

  protected standingLine(): string {
    const one = this.reputation.ofCompany(this.company().id);

    return one.totalCount === 0
      ? 'Sin historial todavía'
      : `${porcentaje(one.pct)} · ${one.keptCount} de ${one.totalCount} compromisos cumplidos`;
  }

  protected readonly facts = computed<readonly ArenaKeyValueRow[]>(() => {
    const company = this.company();

    return [
      { term: 'Sucursales', value: this.branches().length.toString(), numeric: true },
      { term: 'Ciudades', value: this.cities().join(', ') },
      { term: 'Categorías', value: company.categories.join(', ') },
      { term: 'Desde', value: company.since, numeric: true },
      {
        term: 'Cumplimiento',
        value: this.standingLine(),
        numeric: true,
      },
    ];
  });

  protected readonly schema = computed<Record<string, unknown>>(() => {
    const company = this.company();

    return {
      '@context': 'https://schema.org',
      '@type': this.restaurant() ? 'Restaurant' : 'Store',
      '@id': `${SITE_ORIGIN}${this.path()}#organization`,
      name: company.name,
      description: company.summary,
      url: `${SITE_ORIGIN}${this.path()}`,
      areaServed: this.cities().map((one) => ({ '@type': 'City', name: one })),
      foundingDate: company.since,
      department: this.branches().map((branch) => ({
        '@type': this.restaurant() ? 'Restaurant' : 'Store',
        name: branch.name,
        url: `${SITE_ORIGIN}${this.path()}/${branch.slug}`,
        address: {
          '@type': 'PostalAddress',
          streetAddress: branch.address,
          addressLocality: this.geography.nameOf(branch.cityId),
          addressCountry: 'BO',
        },
      })),
      makesOffer: this.products().map((product) => ({
        '@type': 'Offer',
        name: product.name,
        price: product.priceBob,
        priceCurrency: PRICE_CURRENCY,
      })),
    };
  });

  constructor() {
    effect(() => {
      const company = this.company();

      this.metadata.apply({
        title: company.name,
        description: `${company.summary} ${this.branches().length} sucursales en ${this.cities().join(', ')}.`,
        canonical: this.path(),
        robots: 'index,follow',
        type: 'website',
      });
    });
  }

  protected companyOf(branchId: string) {
    return this.businesses.companyOfBranch(branchId);
  }

  protected price(value: number): string {
    return bs(value);
  }

  protected goTo(crumb: ArenaCrumb): void {
    if (crumb.href) {
      void this.router.navigateByUrl(this.location.normalize(crumb.href));
    }
  }
}
