import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  ArenaInput,
  ArenaKeyValue,
  ArenaKeyValueRow,
  ArenaPageHead,
  ArenaSelect,
  ArenaSelectOption,
  ArenaSwitch,
} from '@dravensoft/arena-angular';
import { Marketplace } from '../../../domain/marketplace';
import { Session } from '../../../domain/session';
import { bs } from '../../../domain/format';

const PREP: readonly ArenaSelectOption[] = [
  { value: '15', label: '15 minutos' },
  { value: '25', label: '25 minutos' },
  { value: '40', label: '40 minutos' },
];

@Component({
  selector: 'app-restaurant-settings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [ArenaPageHead, ArenaSwitch, ArenaSelect, ArenaInput, ArenaKeyValue],
  templateUrl: './settings.html',
})
export class RestaurantSettings {
  private readonly marketplace = inject(Marketplace);
  private readonly session = inject(Session);

  protected readonly prepOptions = PREP;
  protected readonly prep = signal('25');
  protected readonly acceptsAuto = signal(false);

  protected readonly slug = computed(() => this.session.profile()?.slug ?? 'pollos-copacabana');

  protected readonly merchant = computed(() => this.marketplace.bySlug(this.slug()));

  protected readonly facts = computed<readonly ArenaKeyValueRow[]>(() => {
    const merchant = this.merchant();

    if (!merchant) {
      return [];
    }

    return [
      { term: 'Ciudad', value: `${merchant.city} · ${merchant.zone}` },
      { term: 'Costo de envío', value: bs(merchant.deliveryBob), numeric: true },
      { term: 'Categorías publicadas', value: merchant.categories.join(', ') },
    ];
  });

  protected toggleOpen(): void {
    const merchant = this.merchant();

    if (merchant) {
      this.marketplace.setOpen(merchant.slug, !merchant.open);
    }
  }
}
