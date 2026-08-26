import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  ArenaAlert,
  ArenaButton,
  ArenaInput,
  ArenaKeyValue,
  ArenaKeyValueRow,
  ArenaPageHead,
  ArenaSection,
  ArenaSwitch,
} from '@dravensoft/arena-angular';
import { Agreements } from '../../../domain/agreements';
import { Businesses } from '../../../domain/businesses';
import { Geography } from '../../../domain/geography';
import { Session } from '../../../domain/session';
import { bs, minutos } from '../../../domain/format';
import { CardDraft, cardLabel, completeCard } from '../../../domain/payments.model';
import { Notices } from '../../../layout/notices';

@Component({
  selector: 'app-branch-settings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [
    ArenaPageHead,
    ArenaSection,
    ArenaSwitch,
    ArenaKeyValue,
    ArenaAlert,
    ArenaInput,
    ArenaButton,
  ],
  templateUrl: './settings.html',
})
export class BranchSettings {
  private readonly agreements = inject(Agreements);
  private readonly geography = inject(Geography);
  private readonly notices = inject(Notices);
  private readonly session = inject(Session);

  protected readonly businesses = inject(Businesses);

  protected readonly branchId = computed(() => this.session.branchId() ?? '');

  protected readonly branch = computed(() => this.businesses.branchById(this.branchId()));

  protected readonly open = computed(() => this.branch()?.open === true);

  protected readonly riders = computed(() => this.agreements.ridersOf(this.branchId()));

  protected readonly card = computed(() => this.branch()?.card);

  protected readonly cardName = computed(() => {
    const card = this.card();

    return card ? cardLabel(card) : 'Ninguna registrada';
  });

  protected readonly draft = signal<CardDraft>({
    brand: '',
    last4: '',
    holder: '',
    expires: '',
  });

  protected readonly readyCard = computed(() => completeCard(this.draft()));

  protected onBrand(brand: string): void {
    this.draft.update((one) => ({ ...one, brand }));
  }

  protected onLast4(last4: string): void {
    this.draft.update((one) => ({ ...one, last4 }));
  }

  protected onHolder(holder: string): void {
    this.draft.update((one) => ({ ...one, holder }));
  }

  protected onExpires(expires: string): void {
    this.draft.update((one) => ({ ...one, expires }));
  }

  protected saveCard(): void {
    if (!this.readyCard()) {
      return;
    }

    const draft = this.draft();

    this.businesses.setBranchCard(this.branchId(), {
      brand: draft.brand.trim(),
      last4: draft.last4.trim(),
      holder: draft.holder.trim(),
      expires: draft.expires.trim(),
    });

    this.draft.set({ brand: '', last4: '', holder: '', expires: '' });
    this.notices.cardSaved();
  }

  protected removeCard(): void {
    this.businesses.setBranchCard(this.branchId(), undefined);
    this.notices.cardRemoved();
  }

  protected readonly facts = computed<readonly ArenaKeyValueRow[]>(() => {
    const branch = this.branch();

    if (!branch) {
      return [];
    }

    return [
      { term: 'Ciudad', value: this.geography.nameOf(branch.cityId) },
      { term: 'Zona', value: branch.zone },
      { term: 'Dirección', value: branch.address },
      { term: 'Teléfono', value: branch.phone, numeric: true },
      { term: 'Preparación', value: minutos(branch.prepMinutes), numeric: true },
      { term: 'Envío base', value: bs(this.businesses.deliveryFeeOf(branch.id)), numeric: true },
      { term: 'Encargado', value: branch.managerName },
      ...branch.hours.map((one) => ({
        term: one.days,
        value: `${one.opens} a ${one.closes}`,
        numeric: true,
      })),
    ];
  });

  protected toggleOpen(): void {
    this.businesses.setOpen(this.branchId(), !this.open());
  }
}
