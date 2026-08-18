import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  ArenaActions,
  ArenaButton,
  ArenaGrid,
  ArenaHero,
  ArenaSection,
  ArenaStatCard,
} from '@dravensoft/arena-angular';

@Component({
  selector: 'app-drive',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [ArenaHero, ArenaActions, ArenaButton, ArenaSection, ArenaGrid, ArenaStatCard],
  templateUrl: './drive.html',
})
export class Drive {
  private readonly router = inject(Router);

  protected goTo(path: string): void {
    void this.router.navigateByUrl(path);
  }
}
