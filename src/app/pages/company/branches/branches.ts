import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  ArenaAlert,
  ArenaEmptyState,
  ArenaGrid,
  ArenaPageHead,
  ArenaSection,
  ArenaStatCard,
  ArenaTable,
  ArenaTableCell,
  ArenaTableColumn,
  ArenaTableRow,
} from '@dravensoft/arena-angular';
import { Agreements } from '../../../domain/agreements';
import { Businesses } from '../../../domain/businesses';
import { Geography } from '../../../domain/geography';
import { Orders } from '../../../domain/orders';
import { Session } from '../../../domain/session';
import { Branch } from '../../../domain/businesses.model';
import { bs, minutos } from '../../../domain/format';

const COLUMNS: readonly ArenaTableColumn[] = [
  { header: 'Sucursal' },
  { header: 'Ciudad' },
  { header: 'Riders', align: 'right' },
  { header: 'En curso', align: 'right' },
  { header: 'Estado' },
];

@Component({
  selector: 'app-company-branches',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [
    ArenaPageHead,
    ArenaSection,
    ArenaGrid,
    ArenaStatCard,
    ArenaAlert,
    ArenaTable,
    ArenaTableRow,
    ArenaTableCell,
    ArenaEmptyState,
  ],
  templateUrl: './branches.html',
})
export class CompanyBranches {
  private readonly router = inject(Router);
  private readonly agreements = inject(Agreements);
  private readonly geography = inject(Geography);
  private readonly orders = inject(Orders);
  private readonly session = inject(Session);

  protected readonly businesses = inject(Businesses);

  protected readonly columns = COLUMNS;

  protected readonly companyId = computed(() => this.session.companyId() ?? '');

  protected readonly company = computed(() => this.businesses.companyById(this.companyId()));

  protected readonly branches = computed(() => this.businesses.branchesOf(this.companyId()));

  protected readonly open = computed(() => this.branches().filter((one) => one.open));

  protected readonly cities = computed(() => this.businesses.citiesOf(this.companyId()));

  protected readonly isImporter = computed(() => this.company()?.type === 'importadora');

  protected readonly stranded = computed(() =>
    this.branches().filter((one) => this.agreements.ridersOf(one.id).length === 0),
  );

  protected readonly unreachable = computed(() =>
    this.geography.all().filter((one) => !this.cities().includes(one.id)),
  );

  protected cityName(id: string): string {
    return this.geography.nameOf(id);
  }

  protected riders(branch: Branch): number {
    return this.agreements.ridersOf(branch.id).length;
  }

  protected running(branch: Branch): number {
    return this.orders.liveOfBranch(branch.id).length;
  }

  protected stateOf(branch: Branch): string {
    if (!branch.open) {
      return 'Cerrada';
    }

    return this.riders(branch) === 0 ? 'Abierta, sin riders' : 'Operando';
  }

  protected facts(branch: Branch): string {
    return `${minutos(branch.prepMinutes)} · envío ${bs(branch.deliveryBob)}`;
  }

  protected open_(branch: Branch): void {
    void this.router.navigateByUrl(`/empresa/sucursales/${branch.id}`);
  }
}
