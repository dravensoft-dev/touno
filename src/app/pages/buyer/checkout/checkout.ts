import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  ArenaAlert,
  ArenaButton,
  ArenaEmptyState,
  ArenaInput,
  ArenaKeyValue,
  ArenaKeyValueRow,
  ArenaPageHead,
  ArenaRadio,
  ArenaRadioGroup,
  ArenaSelect,
  ArenaSelectOption,
} from '@dravensoft/arena-angular';
import { Businesses } from '../../../domain/businesses';
import { Cart } from '../../../domain/cart';
import { Checkout } from '../../../domain/draft';
import { Geography } from '../../../domain/geography';
import { Orders } from '../../../domain/orders';
import { Session } from '../../../domain/session';
import { DeliveryChoice } from '../../../domain/orders.model';
import { bs } from '../../../domain/format';
import { Notices } from '../../../layout/notices';

@Component({
  selector: 'app-checkout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [
    ArenaPageHead,
    ArenaRadioGroup,
    ArenaRadio,
    ArenaInput,
    ArenaSelect,
    ArenaAlert,
    ArenaKeyValue,
    ArenaButton,
    ArenaEmptyState,
  ],
  templateUrl: './checkout.html',
})
export class CheckoutPage {
  private readonly router = inject(Router);
  private readonly businesses = inject(Businesses);
  private readonly geography = inject(Geography);
  private readonly orders = inject(Orders);
  private readonly session = inject(Session);
  private readonly notices = inject(Notices);

  protected readonly cart = inject(Cart);
  protected readonly checkout = inject(Checkout);

  protected readonly homeCity = computed(() => {
    const phone = this.session.buyerPhone();
    const mine = phone ? this.orders.ofBuyer(phone) : [];

    return mine[0]?.buyerCityId ?? this.geography.all()[0].id;
  });

  protected readonly homeCityName = computed(() => this.geography.nameOf(this.homeCity()));

  protected readonly awayBranches = computed(() =>
    this.cart.branches().flatMap((one) => {
      const branch = this.businesses.branchById(one);

      return branch && branch.cityId !== this.homeCity() ? [branch] : [];
    }),
  );

  protected readonly interurban = computed(() => this.awayBranches().length > 0);

  protected readonly localBranches = computed<readonly ArenaSelectOption[]>(() =>
    this.awayBranches().flatMap((away) => {
      const local = this.businesses.branchOfIn(away.companyId, this.homeCity());

      return local ? [{ value: local.id, label: `${local.name} · ${local.address}` }] : [];
    }),
  );

  protected readonly chosenBranchName = computed(() => {
    const id = this.checkout.current().destinationBranchId;

    return id ? (this.businesses.branchById(id)?.name ?? '') : '';
  });

  protected readonly summary = computed<readonly ArenaKeyValueRow[]>(() => [
    { term: 'Productos', value: bs(this.cart.subtotalBob()), numeric: true },
    { term: 'Envíos', value: bs(this.cart.deliveryBob()), numeric: true },
  ]);

  protected readonly total = computed<ArenaKeyValueRow>(() => ({
    term: 'Total',
    value: bs(this.cart.totalBob()),
    numeric: true,
  }));

  protected readonly ready = computed(() => {
    if (!this.interurban()) {
      return this.checkout.current().address.trim() !== '';
    }

    return this.checkout.ready();
  });

  protected pickDelivery(choice: string): void {
    this.checkout.patch({ delivery: choice as DeliveryChoice });
  }

  protected setAddress(address: string): void {
    this.checkout.patch({ address });
  }

  protected setBranch(destinationBranchId: string): void {
    this.checkout.patch({ destinationBranchId });
  }

  protected confirm(): void {
    this.notices.orderPlaced('TO-2299');
    this.cart.clear();
    this.checkout.reset();
    void this.router.navigateByUrl('/mis-pedidos');
  }

  protected back(): void {
    void this.router.navigateByUrl('/carrito');
  }
}
