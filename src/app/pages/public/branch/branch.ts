import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import {
  ArenaActions,
  ArenaAlert,
  ArenaBadge,
  ArenaBreadcrumbs,
  ArenaCrumb,
  ArenaEmptyState,
  ArenaGrid,
  ArenaKeyValue,
  ArenaKeyValueRow,
  ArenaPageHead,
  ArenaSection,
  ArenaTab,
  ArenaTabs,
} from '@dravensoft/arena-angular';
import { ArenaMetadataService } from '@dravensoft/arena-angular/metadata';
import { Businesses } from '../../../domain/businesses';
import { Reputation } from '../../../domain/reputation';
import { Cart } from '../../../domain/cart';
import { Catalog } from '../../../domain/catalog';
import { Geography } from '../../../domain/geography';
import { BusinessType, pathOfType } from '../../../domain/businesses.model';
import { Product } from '../../../domain/catalog.model';
import { bs, minutos, porcentaje } from '../../../domain/format';
import { Notices } from '../../../layout/notices';
import { ProductCard } from '../../../shared/product-card/product-card';
import { StructuredData } from '../../../seo/structured-data';
import { PRICE_CURRENCY, SITE_ORIGIN } from '../../../seo/site';

const DAYS: Record<string, readonly string[]> = {
  'Lunes a viernes': ['Mo', 'Tu', 'We', 'Th', 'Fr'],
  'Lunes a domingo': ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
  Sábado: ['Sa'],
};

@Component({
  selector: 'app-branch-detail-public',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [
    ArenaBreadcrumbs,
    ArenaPageHead,
    ArenaActions,
    ArenaBadge,
    ArenaSection,
    ArenaTabs,
    ArenaTab,
    ArenaGrid,
    ArenaKeyValue,
    ArenaAlert,
    ArenaEmptyState,
    ProductCard,
    StructuredData,
  ],
  templateUrl: './branch.html',
})
export class BranchDetail {
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly metadata = inject(ArenaMetadataService);
  private readonly cart = inject(Cart);
  private readonly notices = inject(Notices);

  protected readonly businesses = inject(Businesses);
  private readonly reputation = inject(Reputation);
  protected readonly catalog = inject(Catalog);
  protected readonly geography = inject(Geography);

  readonly empresa = input('');
  readonly sucursal = input('');
  readonly type = input.required<BusinessType>();

  protected readonly branch = computed(() => {
    const branch = this.businesses.bySlugPair(this.empresa(), this.sucursal());

    if (!branch) {
      throw new Error(`Unknown branch: ${this.empresa()}/${this.sucursal()}`);
    }

    return branch;
  });

  protected readonly company = computed(() => {
    const company = this.businesses.companyById(this.branch().companyId);

    if (!company) {
      throw new Error(`Unknown company: ${this.empresa()}`);
    }

    return company;
  });

  protected readonly segment = computed(() => pathOfType(this.type()));

  protected readonly path = computed(
    () => `/${this.segment()}/${this.empresa()}/${this.sucursal()}`,
  );

  protected readonly restaurant = computed(() => this.type() === 'restaurante');

  protected readonly cityName = computed(() => this.geography.nameOf(this.branch().cityId));

  protected readonly products = computed(() => this.catalog.ofBranch(this.branch().id));

  protected readonly categories = computed(() => [
    ...new Set(this.products().map((one) => one.category)),
  ]);

  protected readonly siblings = computed(() =>
    this.businesses
      .branchesOf(this.company().id)
      .filter((one) => one.id !== this.branch().id)
      .map((one) => ({
        branch: one,
        cityName: this.geography.nameOf(one.cityId),
        path: `/${this.segment()}/${this.empresa()}/${one.slug}`,
        href: this.location.prepareExternalUrl(`/${this.segment()}/${this.empresa()}/${one.slug}`),
      })),
  );

  protected readonly crumbs = computed<readonly ArenaCrumb[]>(() => [
    { label: 'Inicio', href: this.location.prepareExternalUrl('/') },
    {
      label: this.restaurant() ? 'Restaurantes' : 'Importadoras',
      href: this.location.prepareExternalUrl(`/${this.segment()}`),
    },
    {
      label: this.company().name,
      href: this.location.prepareExternalUrl(`/${this.segment()}/${this.empresa()}`),
    },
    { label: this.branch().name },
  ]);

  protected standingLine(): string {
    const one = this.reputation.of(this.branch().id);

    return one.totalCount === 0
      ? 'Sucursal nueva, sin historial todavía'
      : `${porcentaje(one.pct)} · ${one.keptCount} de ${one.totalCount} compromisos cumplidos`;
  }

  protected readonly facts = computed<readonly ArenaKeyValueRow[]>(() => {
    const branch = this.branch();

    return [
      { term: 'Dirección', value: branch.address },
      { term: 'Ciudad', value: `${this.cityName()} · ${branch.zone}` },
      { term: 'Teléfono', value: branch.phone, numeric: true },
      {
        term: this.restaurant() ? 'Preparación' : 'Despacho',
        value: minutos(branch.prepMinutes),
        numeric: true,
      },
      { term: 'Envío desde', value: bs(branch.deliveryBob), numeric: true },
      { term: 'Cumplimiento', value: this.standingLine(), numeric: true },
      ...branch.hours.map((one) => ({
        term: one.days,
        value: `${one.opens} a ${one.closes}`,
        numeric: true,
      })),
    ];
  });

  protected readonly schema = computed<Record<string, unknown>>(() => {
    const branch = this.branch();
    const company = this.company();

    return {
      '@context': 'https://schema.org',
      '@type': this.restaurant() ? 'Restaurant' : 'Store',
      '@id': `${SITE_ORIGIN}${this.path()}#local`,
      name: branch.name,
      description: company.summary,
      url: `${SITE_ORIGIN}${this.path()}`,
      telephone: branch.phone,
      address: {
        '@type': 'PostalAddress',
        streetAddress: branch.address,
        addressLocality: this.cityName(),
        addressCountry: 'BO',
      },
      areaServed: { '@type': 'City', name: this.cityName() },
      parentOrganization: {
        '@type': 'Organization',
        name: company.name,
        url: `${SITE_ORIGIN}/${this.segment()}/${this.empresa()}`,
      },
      openingHoursSpecification: branch.hours.map((one) => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: DAYS[one.days] ?? [],
        opens: one.opens,
        closes: one.closes,
      })),
      makesOffer: this.products().map((product) => ({
        '@type': 'Offer',
        name: product.name,
        price: this.catalog.priceOf(product.id, this.branch().id),
        priceCurrency: PRICE_CURRENCY,
        availability: 'https://schema.org/InStock',
      })),
    };
  });

  constructor() {
    effect(() => {
      const branch = this.branch();

      this.metadata.apply({
        title: `${branch.name} · ${this.cityName()}`,
        description: `${branch.address}, ${this.cityName()}. ${this.company().summary} Pide y sigue tu pedido en el mapa con Touno.`,
        canonical: this.path(),
        robots: 'index,follow',
        type: 'website',
      });
    });
  }

  protected priceOf(product: Product): number {
    return this.catalog.priceOf(product.id, this.branch().id);
  }

  protected inCategory(category: string): readonly Product[] {
    return this.products().filter((one) => one.category === category);
  }

  protected fallbackIcon(): string {
    return this.restaurant() ? 'ph ph-fork-knife' : 'ph ph-package';
  }

  protected addToCart(product: Product): void {
    this.cart.add(product, this.branch().id);
    this.notices.addedToCart(product.name);
  }

  protected goTo(crumb: ArenaCrumb): void {
    if (crumb.href) {
      void this.router.navigateByUrl(this.location.normalize(crumb.href));
    }
  }

  protected openSibling(event: Event, path: string): void {
    event.preventDefault();
    void this.router.navigateByUrl(path);
  }
}
