import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import {
  ArenaAlert,
  ArenaButton,
  ArenaEmptyState,
  ArenaKeyValue,
  ArenaKeyValueRow,
  ArenaPageHead,
  ArenaSwitch,
} from '@dravensoft/arena-angular';
import { Businesses } from '../../../domain/businesses';
import { Catalog } from '../../../domain/catalog';
import { Session } from '../../../domain/session';
import { bs } from '../../../domain/format';
import { Notices } from '../../../layout/notices';

@Component({
  selector: 'app-branch-stock-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [ArenaPageHead, ArenaKeyValue, ArenaSwitch, ArenaAlert, ArenaButton, ArenaEmptyState],
  templateUrl: './stock-item.html',
})
export class BranchStockItem {
  private readonly router = inject(Router);
  private readonly businesses = inject(Businesses);
  private readonly notices = inject(Notices);
  private readonly session = inject(Session);

  protected readonly catalog = inject(Catalog);

  readonly id = input('');

  protected readonly product = computed(() => this.catalog.byId(this.id()));

  protected readonly branchId = computed(() => this.session.branchId() ?? '');

  protected readonly branch = computed(() => this.businesses.branchById(this.branchId()));

  protected readonly available = computed(() => {
    const product = this.product();

    return product ? this.catalog.isAvailable(this.branchId(), product.id) : false;
  });

  protected readonly elsewhere = computed(() => {
    const product = this.product();

    if (!product) {
      return [];
    }

    return this.businesses
      .branchesOf(product.companyId)
      .filter((one) => one.id !== this.branchId())
      .filter((one) => this.catalog.isAvailable(one.id, product.id));
  });

  protected readonly facts = computed<readonly ArenaKeyValueRow[]>(() => {
    const product = this.product();

    if (!product) {
      return [];
    }

    return [
      { term: 'Categoría', value: product.category },
      { term: 'Precio de la empresa', value: bs(product.priceBob), numeric: true },
      { term: 'Vendidos este mes', value: product.soldThisMonth.toString(), numeric: true },
      { term: 'A la venta en', value: `${this.elsewhere().length} sucursales más` },
    ];
  });

  protected toggle(): void {
    const product = this.product();

    if (product) {
      const next = !this.available();

      this.catalog.setAvailability(this.branchId(), product.id, next);
      this.notices.availabilityChanged(product.name, next);
    }
  }

  protected back(): void {
    const segment = this.session.businessType() === 'restaurante' ? 'carta' : 'catalogo';

    void this.router.navigateByUrl(`/sucursal/${segment}`);
  }
}
