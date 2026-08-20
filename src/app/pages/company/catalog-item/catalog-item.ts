import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import {
  ArenaAlert,
  ArenaButton,
  ArenaEmptyState,
  ArenaKeyValue,
  ArenaKeyValueRow,
  ArenaPageHead,
  ArenaSection,
} from '@dravensoft/arena-angular';
import { Businesses } from '../../../domain/businesses';
import { Catalog } from '../../../domain/catalog';
import { Geography } from '../../../domain/geography';
import { Session } from '../../../domain/session';
import { bs } from '../../../domain/format';

@Component({
  selector: 'app-company-catalog-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [ArenaPageHead, ArenaSection, ArenaKeyValue, ArenaAlert, ArenaButton, ArenaEmptyState],
  templateUrl: './catalog-item.html',
})
export class CompanyCatalogItem {
  private readonly router = inject(Router);
  private readonly geography = inject(Geography);
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
      { term: 'Precio', value: bs(product.priceBob), numeric: true },
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

  protected cityOf(cityId: string): string {
    return this.geography.nameOf(cityId);
  }

  protected back(): void {
    void this.router.navigateByUrl('/empresa/catalogo');
  }
}
