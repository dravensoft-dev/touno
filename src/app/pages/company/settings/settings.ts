import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ArenaEmptyState, ArenaPageHead } from '@dravensoft/arena-angular';

@Component({
  selector: 'app-company-settings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [ArenaPageHead, ArenaEmptyState],
  templateUrl: './settings.html',
})
export class CompanySettings {}
