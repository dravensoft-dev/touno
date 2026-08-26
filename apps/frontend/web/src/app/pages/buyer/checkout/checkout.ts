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
import { fareRows, fareTotalRow } from '../../../shared/fare-rows';
import { Cart } from '../../../domain/cart';
import { Checkout } from '../../../domain/draft';
import { Geography } from '../../../domain/geography';
import { Orders } from '../../../domain/orders';
import { Session } from '../../../domain/session';
import { DeliveryChoice } from '../../../domain/orders.model';
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
    const chosen = this.session.cityId();

    if (chosen) {
      return chosen;
    }

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

  protected readonly zones = computed<readonly ArenaSelectOption[]>(() =>
    this.geography.zonesOf(this.homeCity()).map((one) => ({ value: one.name, label: one.name })),
  );

  protected readonly chosenBranchName = computed(() => {
    const id = this.checkout.current().destinationBranchId;

    return id ? (this.businesses.branchById(id)?.name ?? '') : '';
  });

  protected readonly summary = computed<readonly ArenaKeyValueRow[]>(() =>
    fareRows(this.cart.fare()),
  );

  protected readonly total = computed<ArenaKeyValueRow>(() => fareTotalRow(this.cart.fare()));

  protected readonly ready = computed(() => {
    const draft = this.checkout.current();

    if (this.interurban() && draft.delivery === 'sucursal') {
      return draft.destinationBranchId !== '';
    }

    return draft.address.trim() !== '' && draft.zoneName !== '';
  });

  protected pickDelivery(choice: string): void {
    this.checkout.patch({ delivery: choice as DeliveryChoice });
  }

  protected setAddress(address: string): void {
    this.checkout.patch({ address });
  }

  protected setZone(zoneName: string): void {
    this.checkout.patch({ zoneName });
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
