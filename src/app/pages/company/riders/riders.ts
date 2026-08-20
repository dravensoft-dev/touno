import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ArenaEmptyState, ArenaPageHead } from '@dravensoft/arena-angular';

@Component({
  selector: 'app-company-riders',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [ArenaPageHead, ArenaEmptyState],
  templateUrl: './riders.html',
})
export class CompanyRiders {}
