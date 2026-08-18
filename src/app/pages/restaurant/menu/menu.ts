import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  ArenaActions,
  ArenaButton,
  ArenaIconButton,
  ArenaPageHead,
  ArenaSwitch,
  ArenaTab,
  ArenaTable,
  ArenaTableCell,
  ArenaTableColumn,
  ArenaTableRow,
  ArenaTabs,
} from '@dravensoft/arena-angular';
import { Marketplace } from '../../../domain/marketplace';
import { Session } from '../../../domain/session';
import { bs } from '../../../domain/format';

const COLUMNS: readonly ArenaTableColumn[] = [
  { header: 'Producto' },
  { header: 'Precio', align: 'right' },
  { header: 'Vendidos', align: 'right' },
  { header: 'Disponible', mobileLayout: 'block' },
  { header: 'Editar', mobileLayout: 'block' },
];

@Component({
  selector: 'app-restaurant-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [
    ArenaPageHead,
    ArenaActions,
    ArenaButton,
    ArenaTabs,
    ArenaTab,
    ArenaTable,
    ArenaTableRow,
    ArenaTableCell,
    ArenaSwitch,
    ArenaIconButton,
  ],
  templateUrl: './menu.html',
})
export class RestaurantMenu {
  private readonly router = inject(Router);
  private readonly marketplace = inject(Marketplace);
  private readonly session = inject(Session);

  protected readonly columns = COLUMNS;

  protected readonly slug = computed(() => this.session.profile()?.slug ?? 'pollos-copacabana');

  protected readonly categories = computed(() => this.marketplace.categoriesOf(this.slug()));

  protected itemsIn(category: string) {
    return this.marketplace
      .catalogOf(this.slug())
      .filter((one) => one.category === category)
      .map((one) => ({ ...one, price: bs(one.priceBob) }));
  }

  protected toggle(id: string, available: boolean): void {
    this.marketplace.setAvailability(id, available);
  }

  protected edit(id: string): void {
    void this.router.navigateByUrl(`/restaurante/carta/${id}`);
  }
}
