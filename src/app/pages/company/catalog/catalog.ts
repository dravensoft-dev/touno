import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ArenaEmptyState, ArenaPageHead } from '@dravensoft/arena-angular';

@Component({
  selector: 'app-company-catalog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [ArenaPageHead, ArenaEmptyState],
  templateUrl: './catalog.html',
})
export class CompanyCatalog {}
