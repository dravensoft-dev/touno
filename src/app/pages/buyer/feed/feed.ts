import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ArenaGrid, ArenaPageHead, ArenaSection } from '@dravensoft/arena-angular';
import { Cart } from '../../../domain/cart';
import { Marketplace } from '../../../domain/marketplace';
import { Product } from '../../../domain/marketplace.model';
import { ProductCard } from '../../../shared/product-card/product-card';

@Component({
  selector: 'app-feed',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [ArenaPageHead, ArenaSection, ArenaGrid, ProductCard],
  templateUrl: './feed.html',
})
export class Feed {
  private readonly marketplace = inject(Marketplace);
  private readonly cart = inject(Cart);

  protected readonly food = this.marketplace.foodFeed;

  protected readonly parcels = this.marketplace.parcelFeed;

  protected addToCart(product: Product): void {
    this.cart.add(product);
  }
}
