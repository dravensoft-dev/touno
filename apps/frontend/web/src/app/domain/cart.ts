import { Injectable, computed, inject, signal } from '@angular/core';
import { Businesses } from './businesses';
import { Catalog } from './catalog';
import { Checkout } from './draft';
import { Geography } from './geography';
import { Platform } from './platform';
import { Session } from './session';
import { Branch } from './businesses.model';
import { Product } from './catalog.model';
import { EMPTY_FARE, Fare, fareOf, round2, unitsBetween } from './pricing';

export interface CartLine {
  readonly productId: string;
  readonly branchId: string;
  readonly companyId: string;
  readonly name: string;
  readonly unitBob: number;
  readonly qty: number;
}

@Injectable({ providedIn: 'root' })
export class Cart {
  private readonly businesses = inject(Businesses);
  private readonly catalog = inject(Catalog);
  private readonly checkout = inject(Checkout);
  private readonly geography = inject(Geography);
  private readonly platform = inject(Platform);
  private readonly session = inject(Session);

  private readonly lines = signal<readonly CartLine[]>([]);

  readonly all = this.lines.asReadonly();

  readonly count = computed(() => this.all().reduce((sum, one) => sum + one.qty, 0));

  readonly subtotalBob = computed(() =>
    this.all().reduce((sum, one) => sum + one.qty * one.unitBob, 0),
  );

  readonly branches = computed(() => [...new Set(this.all().map((one) => one.branchId))]);

  readonly homeCityId = computed(() => this.session.cityId() ?? this.geography.all()[0].id);

  readonly fare = computed<Fare>(() =>
    this.branches()
      .map((one) => this.fareOfBranch(one))
      .reduce(
        (whole, one) => ({
          productsBob: round2(whole.productsBob + one.productsBob),
          commissionBob: round2(whole.commissionBob + one.commissionBob),
          distanceBob: round2(whole.distanceBob + one.distanceBob),
          weatherBob: round2(whole.weatherBob + one.weatherBob),
          totalBob: round2(whole.totalBob + one.totalBob),
        }),
        EMPTY_FARE,
      ),
  );

  readonly commissionBob = computed(() => this.fare().commissionBob);

  readonly distanceBob = computed(() => this.fare().distanceBob);

  readonly weatherBob = computed(() => this.fare().weatherBob);

  readonly totalBob = computed(() => this.fare().totalBob);

  fareOfBranch(branchId: string): Fare {
    const branch = this.businesses.branchById(branchId);

    if (!branch) {
      return EMPTY_FARE;
    }

    const home = this.homeCityId();
    const handover = this.handoverOf(branch, home);
    const zone = this.geography.zoneOf(home, this.checkout.current().zoneName);
    const away = branch.cityId !== home;
    const from = this.geography.byId(branch.cityId);
    const to = this.geography.byId(home);

    return fareOf({
      productsBob: this.linesOf(branchId).reduce((sum, one) => sum + one.qty * one.unitBob, 0),
      delivery: this.checkout.current().delivery,
      baseFeeBob: handover.deliveryBob,
      cityUnits: zone ? unitsBetween(handover.point, zone.point) : 0,
      interurbanUnits: away && from && to ? unitsBetween(from.point, to.point) : 0,
      adverseWeather: this.geography.isAdverse(home),
      weatherFeeBob: this.businesses.weatherFeeOf(branch.companyId),
      config: this.platform.config(),
    });
  }

  private handoverOf(branch: Branch, cityId: string): Branch {
    return branch.cityId === cityId
      ? branch
      : (this.businesses.branchOfIn(branch.companyId, cityId) ?? branch);
  }

  readonly companies = computed(() => [...new Set(this.all().map((one) => one.companyId))]);

  linesOf(branchId: string): readonly CartLine[] {
    return this.all().filter((one) => one.branchId === branchId);
  }

  add(product: Product, branchId: string): void {
    this.lines.update((list) => {
      const held = list.find((one) => one.productId === product.id && one.branchId === branchId);

      if (held) {
        return list.map((one) => (one === held ? { ...one, qty: one.qty + 1 } : one));
      }

      return [
        ...list,
        {
          productId: product.id,
          branchId,
          companyId: product.companyId,
          name: product.name,
          unitBob: this.catalog.priceOf(product.id, branchId),
          qty: 1,
        },
      ];
    });
  }

  remove(productId: string, branchId: string): void {
    this.lines.update((list) =>
      list.filter((one) => !(one.productId === productId && one.branchId === branchId)),
    );
  }

  clear(): void {
    this.lines.set([]);
  }
}
