import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  ArenaAlert,
  ArenaEmptyState,
  ArenaPageHead,
  ArenaSwitch,
  ArenaTab,
  ArenaTable,
  ArenaTableCell,
  ArenaTableColumn,
  ArenaTableRow,
  ArenaTabs,
} from '@dravensoft/arena-angular';
import { Businesses } from '../../../domain/businesses';
import { Catalog } from '../../../domain/catalog';
import { Session } from '../../../domain/session';
import { Product } from '../../../domain/catalog.model';
import { bs } from '../../../domain/format';
import { Notices } from '../../../layout/notices';

const COLUMNS: readonly ArenaTableColumn[] = [
  { header: 'Artículo' },
  { header: 'Precio', align: 'right' },
  { header: 'Vendidos', align: 'right' },
  { header: 'Hay hoy', align: 'right', mobileLayout: 'block' },
];

@Component({
  selector: 'app-branch-stock',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [
    ArenaPageHead,
    ArenaTabs,
    ArenaTab,
    ArenaTable,
    ArenaTableRow,
    ArenaTableCell,
    ArenaSwitch,
    ArenaAlert,
    ArenaEmptyState,
  ],
  templateUrl: './stock.html',
})
export class BranchStockPage {
  private readonly router = inject(Router);
  private readonly businesses = inject(Businesses);
  private readonly notices = inject(Notices);
  private readonly session = inject(Session);

  protected readonly catalog = inject(Catalog);

  protected readonly columns = COLUMNS;

  protected readonly branchId = computed(() => this.session.branchId() ?? '');

  protected readonly companyId = computed(() => this.session.companyId() ?? '');

  protected readonly branch = computed(() => this.businesses.branchById(this.branchId()));

  protected readonly noun = computed(() =>
    this.session.businessType() === 'restaurante' ? 'la carta' : 'el catálogo',
  );

  protected readonly title = computed(() =>
    this.session.businessType() === 'restaurante' ? 'Carta' : 'Catálogo',
  );

  protected readonly categories = computed(() => this.catalog.categoriesOf(this.companyId()));

  protected readonly active = signal('');

  protected readonly current = computed(() => this.active() || (this.categories()[0] ?? ''));

  protected readonly gone = computed(() =>
    this.catalog
      .ofCompany(this.companyId())
      .filter((one) => !this.catalog.isAvailable(this.branchId(), one.id)),
  );

  protected inCategory(category: string): readonly Product[] {
    return this.catalog.ofCompany(this.companyId()).filter((one) => one.category === category);
  }

  protected price(product: Product): string {
    return bs(product.priceBob);
  }

  protected has(product: Product): boolean {
    return this.catalog.isAvailable(this.branchId(), product.id);
  }

  protected pick(category: string): void {
    this.active.set(category);
  }

  protected toggle(product: Product): void {
    const next = !this.has(product);

    this.catalog.setAvailability(this.branchId(), product.id, next);
    this.notices.availabilityChanged(product.name, next);
  }

  protected open(product: Product): void {
    const segment = this.session.businessType() === 'restaurante' ? 'carta' : 'catalogo';

    void this.router.navigateByUrl(`/sucursal/${segment}/${product.id}`);
  }
}
