import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  ArenaButton,
  ArenaCard,
  ArenaChartCard,
  ArenaEmptyState,
  ArenaGrid,
  ArenaHorizontalBarChart,
  ArenaPageHead,
  ArenaSeries,
  ArenaStatCard,
  ArenaTag,
  ArenaTextarea,
} from '@dravensoft/arena-angular';
import { Marketplace } from '../../../domain/marketplace';
import { Orders } from '../../../domain/orders';
import { Session } from '../../../domain/session';
import { fecha } from '../../../domain/format';

@Component({
  selector: 'app-restaurant-reviews',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [
    ArenaPageHead,
    ArenaGrid,
    ArenaStatCard,
    ArenaChartCard,
    ArenaHorizontalBarChart,
    ArenaCard,
    ArenaTag,
    ArenaTextarea,
    ArenaButton,
    ArenaEmptyState,
  ],
  templateUrl: './reviews.html',
})
export class RestaurantReviews {
  private readonly orders = inject(Orders);
  private readonly marketplace = inject(Marketplace);
  private readonly session = inject(Session);

  protected readonly drafts = signal<Record<string, string>>({});

  protected readonly slug = computed(() => this.session.profile()?.slug ?? 'pollos-copacabana');

  protected readonly merchant = computed(() => this.marketplace.bySlug(this.slug()));

  protected readonly reviewed = computed(() =>
    this.orders.reviewsOf(this.slug()).map((one) => ({
      ...one,
      when: fecha(one.review?.at ?? ''),
      stars: `${one.review?.stars ?? 0} de 5`,
    })),
  );

  protected readonly rating = computed(() => this.merchant()?.rating.toString() ?? '—');

  protected readonly count = computed(() => this.merchant()?.reviewCount.toString() ?? '0');

  protected readonly answered = computed(
    () => `${this.reviewed().filter((one) => one.review?.reply).length}`,
  );

  protected readonly distributionLabels = ['5', '4', '3', '2', '1'];

  protected readonly distribution: readonly ArenaSeries[] = [
    { label: 'Reseñas por puntaje', values: [812, 306, 104, 41, 21], slot: 3 },
  ];

  protected draftOf(slug: string): string {
    return this.drafts()[slug] ?? '';
  }

  protected write(slug: string, text: string): void {
    this.drafts.update((current) => ({ ...current, [slug]: text }));
  }

  protected reply(slug: string): void {
    this.orders.reply(slug, this.draftOf(slug));
    this.write(slug, '');
  }
}
