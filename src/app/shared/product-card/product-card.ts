import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import {
  ArenaBadge,
  ArenaButton,
  ArenaCard,
  ArenaFallback,
  ArenaFigure,
  ArenaMedia,
} from '@dravensoft/arena-angular';
import { Merchant, Product } from '../../domain/marketplace.model';
import { bs } from '../../domain/format';

@Component({
  selector: 'app-product-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [ArenaCard, ArenaFigure, ArenaMedia, ArenaFallback, ArenaBadge, ArenaButton],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
})
export class ProductCard {
  private readonly location = inject(Location);

  readonly product = input.required<Product>();
  readonly merchant = input<Merchant>();
  readonly fallbackIcon = input('ph ph-fork-knife');

  readonly add = output<Product>();

  protected readonly photo = computed(() => {
    const photo = this.product().photo;

    return photo ? this.location.prepareExternalUrl(photo) : undefined;
  });

  protected readonly price = computed(() => bs(this.product().priceBob));

  protected addToCart(): void {
    this.add.emit(this.product());
  }
}
