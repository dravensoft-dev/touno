import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import {
  ArenaAlert,
  ArenaEmptyState,
  ArenaGrid,
  ArenaPageHead,
  ArenaSection,
  ArenaStatCard,
} from '@dravensoft/arena-angular';
import { Agreements } from '../../../domain/agreements';
import { Businesses } from '../../../domain/businesses';
import { Session } from '../../../domain/session';
import { rangeOf } from '../../../domain/riders.model';
import { RiderPicker } from '../../../shared/rider-picker/rider-picker';

@Component({
  selector: 'app-branch-riders',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [
    ArenaPageHead,
    ArenaSection,
    ArenaGrid,
    ArenaStatCard,
    ArenaAlert,
    ArenaEmptyState,
    RiderPicker,
  ],
  templateUrl: './riders.html',
})
export class BranchRiders {
  private readonly agreements = inject(Agreements);
  private readonly businesses = inject(Businesses);
  private readonly session = inject(Session);

  protected readonly branchId = computed(() => this.session.branchId() ?? '');

  protected readonly branch = computed(() => this.businesses.branchById(this.branchId()));

  protected readonly working = computed(() => this.agreements.ridersOf(this.branchId()));

  protected readonly online = computed(() => this.working().filter((one) => one.online));

  protected readonly urban = computed(() =>
    this.working().filter((one) => rangeOf(one.vehicle) === 'urbano'),
  );

  protected readonly longHaul = computed(() =>
    this.working().filter((one) => rangeOf(one.vehicle) === 'interurbano'),
  );

  protected readonly applying = computed(() =>
    this.agreements
      .pending()
      .filter((one) => one.initiatedBy === 'rider' && one.branchIds.includes(this.branchId())),
  );
}
