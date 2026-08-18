import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import {
  ArenaActions,
  ArenaAlert,
  ArenaBadge,
  ArenaBreadcrumbs,
  ArenaCrumb,
  ArenaGrid,
  ArenaKeyValue,
  ArenaKeyValueRow,
  ArenaPageHead,
  ArenaTab,
  ArenaTabs,
} from '@dravensoft/arena-angular';
import { ArenaMetadataService } from '@dravensoft/arena-angular/metadata';
import { Cart } from '../../../domain/cart';
import { Marketplace } from '../../../domain/marketplace';
import { MerchantKind, Product } from '../../../domain/marketplace.model';
import { bs } from '../../../domain/format';
import { ProductCard } from '../../../shared/product-card/product-card';
import { StructuredData } from '../../../seo/structured-data';
import { PRICE_CURRENCY, SITE_ORIGIN } from '../../../seo/site';

@Component({
  selector: 'app-merchant-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [
    ArenaBreadcrumbs,
    ArenaPageHead,
    ArenaActions,
    ArenaBadge,
    ArenaKeyValue,
    ArenaTabs,
    ArenaTab,
    ArenaGrid,
    ArenaAlert,
    ProductCard,
    StructuredData,
  ],
  templateUrl: './merchant-detail.html',
})
export class MerchantDetail {
  private readonly marketplace = inject(Marketplace);
  private readonly cart = inject(Cart);
  private readonly metadata = inject(ArenaMetadataService);
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  readonly slug = input.required<string>();
  readonly kind = input.required<MerchantKind>();

  protected readonly merchant = computed(() => {
    const merchant = this.marketplace.bySlug(this.slug());

    if (!merchant) {
      throw new Error(`Unknown merchant: ${this.slug()}`);
    }

    return merchant;
  });

  protected readonly segment = computed(() =>
    this.kind() === 'restaurante' ? 'restaurantes' : 'tiendas',
  );

  protected readonly path = computed(() => `/${this.segment()}/${this.slug()}`);

  protected readonly crumbs = computed<readonly ArenaCrumb[]>(() => [
    { label: 'Inicio', href: this.location.prepareExternalUrl('/') },
    {
      label: this.kind() === 'restaurante' ? 'Restaurantes' : 'Importadoras',
      href: this.location.prepareExternalUrl(`/${this.segment()}`),
    },
    { label: this.merchant().name },
  ]);

  protected readonly facts = computed<readonly ArenaKeyValueRow[]>(() => {
    const merchant = this.merchant();

    return [
      { term: 'Ciudad', value: `${merchant.city} · ${merchant.zone}` },
      {
        term: this.kind() === 'restaurante' ? 'Tiempo de preparación' : 'Tiempo de despacho',
        value: `${merchant.prepMinutes} min`,
        numeric: true,
      },
      { term: 'Costo de envío', value: bs(merchant.deliveryBob), numeric: true },
      { term: 'Reseñas', value: `${merchant.rating} · ${merchant.reviewCount}`, numeric: true },
    ];
  });

  protected readonly categories = computed(() => this.merchant().categories);

  protected readonly fallbackIcon = computed(() =>
    this.kind() === 'restaurante' ? 'ph ph-fork-knife' : 'ph ph-package',
  );

  protected readonly schema = computed<Record<string, unknown>>(() => {
    const merchant = this.merchant();

    return {
      '@context': 'https://schema.org',
      '@type': this.kind() === 'restaurante' ? 'Restaurant' : 'Store',
      name: merchant.name,
      description: merchant.summary,
      url: `${SITE_ORIGIN}${this.path()}`,
      address: {
        '@type': 'PostalAddress',
        addressLocality: merchant.city,
        addressCountry: 'BO',
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: merchant.rating,
        reviewCount: merchant.reviewCount,
      },
      makesOffer: this.marketplace.catalogOf(merchant.slug).map((product) => ({
        '@type': 'Offer',
        name: product.name,
        price: product.priceBob,
        priceCurrency: PRICE_CURRENCY,
        availability: product.available
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      })),
    };
  });

  constructor() {
    effect(() => {
      const merchant = this.merchant();

      this.metadata.apply({
        title: merchant.name,
        description: `${merchant.summary} Pide en ${merchant.city} y recibe con Touno.`,
        canonical: this.path(),
        type: 'website',
        robots: 'index,follow',
      });
    });
  }

  protected addToCart(product: Product): void {
    this.cart.add(product);
  }

  protected productsIn(category: string) {
    return this.marketplace.catalogOf(this.slug()).filter((one) => one.category === category);
  }

  protected goTo(crumb: ArenaCrumb): void {
    if (crumb.href) {
      void this.router.navigateByUrl(this.location.normalize(crumb.href));
    }
  }
}
