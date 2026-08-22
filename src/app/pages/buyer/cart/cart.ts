import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  ArenaAlert,
  ArenaButton,
  ArenaEmptyState,
  ArenaIconButton,
  ArenaKeyValue,
  ArenaKeyValueRow,
  ArenaPageHead,
  ArenaTable,
  ArenaTableCell,
  ArenaTableColumn,
  ArenaTableRow,
} from '@dravensoft/arena-angular';
import { Businesses } from '../../../domain/businesses';
import { fareRows, fareTotalRow } from '../../../shared/fare-rows';
import { Cart, CartLine } from '../../../domain/cart';
import { Geography } from '../../../domain/geography';
import { Orders } from '../../../domain/orders';
import { Session } from '../../../domain/session';
import { bs } from '../../../domain/format';

interface Basket {
  readonly branchId: string;
  readonly branchName: string;
  readonly cityName: string;
  readonly awayFromHome: boolean;
  readonly deliveryBob: string;
  readonly lines: readonly (CartLine & { readonly subtotal: string })[];
}

const COLUMNS: readonly ArenaTableColumn[] = [
  { header: 'Producto' },
  { header: 'Cantidad', align: 'right' },
  { header: 'Subtotal', align: 'right' },
  { header: 'Quitar', align: 'right', mobileLayout: 'block' },
];

@Component({
  selector: 'app-buyer-cart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [
    ArenaPageHead,
    ArenaTable,
    ArenaTableRow,
    ArenaTableCell,
    ArenaIconButton,
    ArenaKeyValue,
    ArenaAlert,
    ArenaButton,
    ArenaEmptyState,
  ],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class BuyerCart {
  private readonly router = inject(Router);
  private readonly businesses = inject(Businesses);
  private readonly geography = inject(Geography);
  private readonly orders = inject(Orders);
  private readonly session = inject(Session);

  protected readonly cart = inject(Cart);

  protected readonly columns = COLUMNS;

  protected readonly homeCity = computed(() => {
    const phone = this.session.buyerPhone();
    const mine = phone ? this.orders.ofBuyer(phone) : [];

    return mine[0]?.buyerCityId ?? this.geography.all()[0].id;
  });

  protected readonly baskets = computed<readonly Basket[]>(() =>
    this.cart.branches().map((branchId) => {
      const branch = this.businesses.branchById(branchId);

      return {
        branchId,
        branchName: branch?.name ?? branchId,
        cityName: this.geography.nameOf(branch?.cityId ?? ''),
        awayFromHome: branch !== undefined && branch.cityId !== this.homeCity(),
        deliveryBob: bs(this.cart.fareOfBranch(branchId).distanceBob),
        lines: this.cart.linesOf(branchId).map((line) => ({
          ...line,
          subtotal: bs(line.unitBob * line.qty),
        })),
      };
    }),
  );

  protected readonly interurban = computed(() => this.baskets().filter((one) => one.awayFromHome));

  protected readonly summary = computed<readonly ArenaKeyValueRow[]>(() =>
    fareRows(this.cart.fare()),
  );

  protected readonly total = computed<ArenaKeyValueRow>(() => fareTotalRow(this.cart.fare()));

  protected remove(line: CartLine): void {
    this.cart.remove(line.productId, line.branchId);
  }

  protected toDelivery(): void {
    void this.router.navigateByUrl('/carrito/entrega');
  }

  protected browse(): void {
    void this.router.navigateByUrl('/');
  }
}
