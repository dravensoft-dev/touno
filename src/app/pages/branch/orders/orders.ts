import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ArenaEmptyState, ArenaPageHead } from '@dravensoft/arena-angular';

@Component({
  selector: 'app-branch-orders',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [ArenaPageHead, ArenaEmptyState],
  templateUrl: './orders.html',
})
export class BranchOrders {}
