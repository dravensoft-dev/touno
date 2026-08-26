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
import { Catalog } from '../../../domain/catalog';
import { Geography } from '../../../domain/geography';
import { Orders } from '../../../domain/orders';
import { Reputation } from '../../../domain/reputation';
import { Session } from '../../../domain/session';
import { Branch } from '../../../domain/businesses.model';
import { BranchCard } from '../../../shared/branch-card/branch-card';

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
    BranchCard,
  ],
  templateUrl: './feed.html',
})
export class Feed {
  private readonly router = inject(Router);
  private readonly orders = inject(Orders);
  private readonly reputation = inject(Reputation);
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

  protected readonly food = computed(() => this.openOfType('restaurante'));

  protected readonly parcels = computed(() => this.openOfType('importadora'));

  protected readonly reachable = computed(() =>
    this.businesses
      .companiesOfType('importadora')
      .filter((one) => this.businesses.hasBranchIn(one.id, this.city()))
      .filter((one) => this.businesses.citiesOf(one.id).length > 1),
  );

  protected pickCity(cityId: string): void {
    this.chosen.set(cityId);
  }

  protected companyOf(branch: Branch) {
    return this.businesses.companyById(branch.companyId);
  }

  protected goTo(path: string): void {
    void this.router.navigateByUrl(path);
  }

  private openOfType(type: 'restaurante' | 'importadora'): readonly Branch[] {
    const open = this.businesses
      .branchesIn(this.city())
      .filter((one) => one.open && this.businesses.typeOfBranch(one.id) === type);

    return this.reputation.bestFirst(open);
  }
}
