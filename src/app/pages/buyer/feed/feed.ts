import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  ArenaAction,
  ArenaActions,
  ArenaButton,
  ArenaEmptyState,
  ArenaGrid,
  ArenaPageHead,
  ArenaSection,
  ArenaSelect,
  ArenaSelectOption,
} from '@dravensoft/arena-angular';
import { Businesses } from '../../../domain/businesses';
import { Cart } from '../../../domain/cart';
import { Catalog } from '../../../domain/catalog';
import { FeedItem } from '../../../domain/catalog.model';
import { Geography } from '../../../domain/geography';
import { Orders } from '../../../domain/orders';
import { Session } from '../../../domain/session';
import { Notices } from '../../../layout/notices';
import { ProductCard } from '../../../shared/product-card/product-card';

@Component({
  selector: 'app-feed',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [
    ArenaPageHead,
    ArenaAction,
    ArenaActions,
    ArenaButton,
    ArenaSection,
    ArenaGrid,
    ArenaSelect,
    ArenaEmptyState,
    ProductCard,
  ],
  templateUrl: './feed.html',
})
export class Feed {
  private readonly router = inject(Router);
  private readonly cart = inject(Cart);
  private readonly notices = inject(Notices);
  private readonly orders = inject(Orders);
  private readonly session = inject(Session);

  protected readonly catalog = inject(Catalog);
  protected readonly businesses = inject(Businesses);
  protected readonly geography = inject(Geography);

  private readonly homeCity = computed(() => {
    const phone = this.session.buyerPhone();
    const mine = phone ? this.orders.ofBuyer(phone) : [];

    return mine[0]?.buyerCityId ?? this.geography.all()[0].id;
  });

  protected readonly chosen = signal<string | null>(null);

  protected readonly city = computed(() => this.chosen() ?? this.homeCity());

  protected readonly cityName = computed(() => this.geography.nameOf(this.city()));

  protected readonly cities = computed<readonly ArenaSelectOption[]>(() =>
    this.geography.all().map((one) => ({ value: one.id, label: one.name })),
  );

  protected readonly food = computed(() => this.catalog.feedOf('restaurante', this.city()));

  protected readonly parcels = computed(() => this.catalog.feedOf('importadora', this.city()));

  protected readonly reachable = computed(() =>
    this.businesses
      .companiesOfType('importadora')
      .filter((one) => this.businesses.hasBranchIn(one.id, this.city()))
      .filter((one) => this.businesses.citiesOf(one.id).length > 1),
  );

  protected pickCity(cityId: string): void {
    this.chosen.set(cityId);
  }

  protected addToCart(item: FeedItem): void {
    this.cart.add(item.product, item.branch.id);
    this.notices.addedToCart(item.product.name);
  }

  protected goTo(path: string): void {
    void this.router.navigateByUrl(path);
  }
}
