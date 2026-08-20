import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import {
  ArenaAlert,
  ArenaButton,
  ArenaEmptyState,
  ArenaGrid,
  ArenaKeyValue,
  ArenaKeyValueRow,
  ArenaPageHead,
  ArenaSection,
  ArenaStatCard,
  ArenaSwitch,
} from '@dravensoft/arena-angular';
import { Agreements } from '../../../domain/agreements';
import { Businesses } from '../../../domain/businesses';
import { Geography } from '../../../domain/geography';
import { Loads } from '../../../domain/loads';
import { Orders } from '../../../domain/orders';
import { Session } from '../../../domain/session';
import { bs, minutos } from '../../../domain/format';
import { RiderPicker } from '../../../shared/rider-picker/rider-picker';

@Component({
  selector: 'app-company-branch-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [
    ArenaPageHead,
    ArenaSection,
    ArenaGrid,
    ArenaStatCard,
    ArenaSwitch,
    ArenaKeyValue,
    ArenaAlert,
    ArenaButton,
    ArenaEmptyState,
    RiderPicker,
  ],
  templateUrl: './branch-detail.html',
})
export class CompanyBranchDetail {
  private readonly router = inject(Router);
  private readonly agreements = inject(Agreements);
  private readonly geography = inject(Geography);
  private readonly loads = inject(Loads);
  private readonly orders = inject(Orders);
  private readonly session = inject(Session);

  protected readonly businesses = inject(Businesses);

  readonly id = input('');

  protected readonly companyId = computed(() => this.session.companyId() ?? '');

  private readonly found = computed(() => this.businesses.branchById(this.id()));

  protected readonly branch = computed(() => {
    const branch = this.found();

    return branch && branch.companyId === this.companyId() ? branch : undefined;
  });

  protected readonly notMine = computed(() => this.found() !== undefined && !this.branch());

  protected readonly riders = computed(() => this.agreements.ridersOf(this.id()));

  protected readonly running = computed(() => this.orders.liveOfBranch(this.id()));

  protected readonly leaving = computed(() => this.loads.leaving(this.id()));

  protected readonly takings = computed(() => bs(this.orders.salesOf(this.id())));

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
      { term: 'Encargado', value: branch.managerName },
      { term: 'Preparación', value: minutos(branch.prepMinutes), numeric: true },
      { term: 'Envío', value: bs(branch.deliveryBob), numeric: true },
      ...branch.hours.map((one) => ({
        term: one.days,
        value: `${one.opens} a ${one.closes}`,
        numeric: true,
      })),
    ];
  });

  protected toggleOpen(): void {
    const branch = this.branch();

    if (branch) {
      this.businesses.setOpen(branch.id, !branch.open);
    }
  }

  protected toRiders(): void {
    void this.router.navigateByUrl('/empresa/riders');
  }

  protected back(): void {
    void this.router.navigateByUrl('/empresa/sucursales');
  }
}
