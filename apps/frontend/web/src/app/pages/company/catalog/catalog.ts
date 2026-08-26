import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  ArenaAlert,
  ArenaEmptyState,
  ArenaPageHead,
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

const COLUMNS: readonly ArenaTableColumn[] = [
  { header: 'Artículo' },
  { header: 'Precio', align: 'right' },
  { header: 'Vendidos', align: 'right' },
  { header: 'A la venta en', align: 'right' },
];

@Component({
  selector: 'app-company-catalog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [
    ArenaPageHead,
    ArenaTabs,
    ArenaTab,
    ArenaTable,
    ArenaTableRow,
    ArenaTableCell,
    ArenaAlert,
    ArenaEmptyState,
  ],
  templateUrl: './catalog.html',
})
export class CompanyCatalog {
  private readonly router = inject(Router);
  private readonly businesses = inject(Businesses);
  private readonly session = inject(Session);

  protected readonly catalog = inject(Catalog);

  protected readonly columns = COLUMNS;

  protected readonly active = signal('');

  protected readonly companyId = computed(() => this.session.companyId() ?? '');

  protected readonly noun = computed(() =>
    this.session.businessType() === 'restaurante' ? 'La carta' : 'El catálogo',
  );

  protected readonly branches = computed(() => this.businesses.branchesOf(this.companyId()));

  protected readonly categories = computed(() => this.catalog.categoriesOf(this.companyId()));

  protected readonly current = computed(() => this.active() || (this.categories()[0] ?? ''));

  protected readonly shortages = computed(() =>
    this.catalog
      .stock()
      .filter((one) => !one.available)
      .filter((one) => this.businesses.branchById(one.branchId)?.companyId === this.companyId()),
  );

  protected inCategory(category: string): readonly Product[] {
    return this.catalog.ofCompany(this.companyId()).filter((one) => one.category === category);
  }

  protected price(product: Product): string {
    return product.priceScope === 'sucursal' ? 'Por sucursal' : bs(product.priceBob);
  }

  protected sellingIn(product: Product): number {
    return this.branches().filter((one) => this.catalog.isAvailable(one.id, product.id)).length;
  }

  protected pick(category: string): void {
    this.active.set(category);
  }

  protected open(product: Product): void {
    void this.router.navigateByUrl(`/empresa/catalogo/${product.id}`);
  }
}
