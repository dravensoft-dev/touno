import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  ArenaAlert,
  ArenaButton,
  ArenaEmptyState,
  ArenaKeyValue,
  ArenaKeyValueRow,
  ArenaInput,
  ArenaPageHead,
  ArenaSection,
  ArenaSwitch,
} from '@dravensoft/arena-angular';
import { Businesses } from '../../../domain/businesses';
import { Catalog } from '../../../domain/catalog';
import { Geography } from '../../../domain/geography';
import { Platform } from '../../../domain/platform';
import { Session } from '../../../domain/session';
import { bs } from '../../../domain/format';
import { commissionOf } from '../../../domain/pricing';
import { Notices } from '../../../layout/notices';

@Component({
  selector: 'app-company-catalog-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [
    ArenaPageHead,
    ArenaSection,
    ArenaKeyValue,
    ArenaAlert,
    ArenaInput,
    ArenaSwitch,
    ArenaButton,
    ArenaEmptyState,
  ],
  templateUrl: './catalog-item.html',
})
export class CompanyCatalogItem {
  private readonly router = inject(Router);
  private readonly geography = inject(Geography);
  private readonly notices = inject(Notices);
  private readonly platform = inject(Platform);
  private readonly session = inject(Session);

  protected readonly businesses = inject(Businesses);
  protected readonly catalog = inject(Catalog);

  readonly id = input('');

  protected readonly companyId = computed(() => this.session.companyId() ?? '');

  private readonly found = computed(() => this.catalog.byId(this.id()));

  protected readonly product = computed(() => {
    const product = this.found();

    return product && product.companyId === this.companyId() ? product : undefined;
  });

  protected readonly notMine = computed(() => this.found() !== undefined && !this.product());

  private readonly typed = signal<string | null>(null);

  private readonly typedByBranch = signal<Record<string, string>>({});

  protected readonly perBranch = computed(() => this.product()?.priceScope === 'sucursal');

  protected readonly branches = computed(() => this.businesses.branchesOf(this.companyId()));

  protected readonly price = computed(() => this.typed() ?? String(this.product()?.priceBob ?? 0));

  protected readonly typedBob = computed(() => Number(this.price()));

  protected readonly commission = computed(() =>
    bs(commissionOf(this.typedBob(), this.platform.config())),
  );

  protected readonly commissionPct = computed(() => this.platform.commissionPct());

  protected readonly distanceFrom = computed(() => {
    const fees = this.branches().map((one) => this.businesses.deliveryFeeOf(one.id));

    return bs(fees.length > 0 ? Math.min(...fees) : this.platform.minDeliveryFeeBob());
  });

  protected readonly weatherFee = computed(() =>
    bs(this.businesses.weatherFeeOf(this.companyId())),
  );

  protected readonly ready = computed(() => {
    if (this.typedBob() <= 0) {
      return false;
    }

    return !this.perBranch() || this.branches().every((one) => this.branchBob(one.id) > 0);
  });

  protected readonly selling = computed(() =>
    this.businesses
      .branchesOf(this.companyId())
      .filter((one) => this.catalog.isAvailable(one.id, this.id())),
  );

  protected readonly out = computed(() =>
    this.businesses
      .branchesOf(this.companyId())
      .filter((one) => !this.catalog.isAvailable(one.id, this.id())),
  );

  protected readonly facts = computed<readonly ArenaKeyValueRow[]>(() => {
    const product = this.product();

    if (!product) {
      return [];
    }

    return [
      { term: 'Categoría', value: product.category },
      {
        term: this.perBranch() ? 'Precio de referencia' : 'Precio',
        value: bs(product.priceBob),
        numeric: true,
      },
      { term: 'Vendidos este mes', value: product.soldThisMonth.toString(), numeric: true },
      { term: 'Destacado', value: product.featured ? 'Sí' : 'No' },
      ...product.variants.map((one) => ({
        term: one.label,
        value: one.deltaBob === 0 ? 'Sin recargo' : `+ ${bs(one.deltaBob)}`,
        numeric: true,
      })),
      ...product.addons.map((one) => ({
        term: one.label,
        value: bs(one.priceBob),
        numeric: true,
      })),
    ];
  });

  protected branchPrice(branchId: string): string {
    const held = this.typedByBranch()[branchId];

    return held ?? String(this.catalog.priceOf(this.id(), branchId));
  }

  protected branchBob(branchId: string): number {
    return Number(this.branchPrice(branchId));
  }

  protected onPrice(value: string): void {
    this.typed.set(value);
  }

  protected onBranchPrice(branchId: string, value: string): void {
    this.typedByBranch.update((held) => ({ ...held, [branchId]: value }));
  }

  protected toggleScope(): void {
    const product = this.product();

    if (product) {
      this.catalog.setPriceScope(product.id, this.perBranch() ? 'marca' : 'sucursal');
      this.typedByBranch.set({});
    }
  }

  protected save(): void {
    const product = this.product();

    if (!product || !this.ready()) {
      return;
    }

    this.catalog.setPrice(product.id, this.typedBob());

    if (this.perBranch()) {
      for (const branch of this.branches()) {
        this.catalog.setBranchPrice(branch.id, product.id, this.branchBob(branch.id));
      }
    }

    this.typed.set(null);
    this.typedByBranch.set({});
    this.notices.priceSaved(product.name);
  }

  protected cityOf(cityId: string): string {
    return this.geography.nameOf(cityId);
  }

  protected back(): void {
    void this.router.navigateByUrl('/empresa/catalogo');
  }
}
