import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import {
  ArenaCard,
  ArenaFallback,
  ArenaFigure,
  ArenaMedia,
  ArenaTag,
} from '@dravensoft/arena-angular';
import { Merchant } from '../../domain/marketplace.model';
import { bs } from '../../domain/format';

@Component({
  selector: 'app-merchant-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [ArenaCard, ArenaFigure, ArenaMedia, ArenaFallback, ArenaTag],
  templateUrl: './merchant-card.html',
  styleUrl: './merchant-card.css',
})
export class MerchantCard {
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  readonly merchant = input.required<Merchant>();
  readonly headingLevel = input<'h2' | 'h3'>('h3');

  protected readonly path = computed(() => {
    const merchant = this.merchant();
    const segment = merchant.kind === 'restaurante' ? 'restaurantes' : 'tiendas';

    return `/${segment}/${merchant.slug}`;
  });

  protected readonly href = computed(() => this.location.prepareExternalUrl(this.path()));

  protected readonly cover = computed(() => {
    const cover = this.merchant().cover;

    return cover ? this.location.prepareExternalUrl(cover) : undefined;
  });

  protected readonly fallbackIcon = computed(() =>
    this.merchant().kind === 'restaurante' ? 'ph ph-fork-knife' : 'ph ph-package',
  );

  protected readonly delivery = computed(() => bs(this.merchant().deliveryBob));

  protected open(): void {
    void this.router.navigateByUrl(this.path());
  }
}
