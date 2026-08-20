import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import {
  ArenaAlert,
  ArenaKeyValue,
  ArenaKeyValueRow,
  ArenaPageHead,
  ArenaSwitch,
} from '@dravensoft/arena-angular';
import { Agreements } from '../../../domain/agreements';
import { Businesses } from '../../../domain/businesses';
import { Geography } from '../../../domain/geography';
import { Session } from '../../../domain/session';
import { bs, minutos } from '../../../domain/format';

@Component({
  selector: 'app-branch-settings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [ArenaPageHead, ArenaSwitch, ArenaKeyValue, ArenaAlert],
  templateUrl: './settings.html',
})
export class BranchSettings {
  private readonly agreements = inject(Agreements);
  private readonly geography = inject(Geography);
  private readonly session = inject(Session);

  protected readonly businesses = inject(Businesses);

  protected readonly branchId = computed(() => this.session.branchId() ?? '');

  protected readonly branch = computed(() => this.businesses.branchById(this.branchId()));

  protected readonly open = computed(() => this.branch()?.open === true);

  protected readonly riders = computed(() => this.agreements.ridersOf(this.branchId()));

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
      { term: 'Envío', value: bs(branch.deliveryBob), numeric: true },
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
