import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import {
  ArenaAlert,
  ArenaPageHead,
  ArenaSwitch,
  ArenaTable,
  ArenaTableCell,
  ArenaTableColumn,
  ArenaTableRow,
} from '@dravensoft/arena-angular';
import { Geography } from '../../../domain/geography';
import { Platform } from '../../../domain/platform';
import { City, weatherLabel } from '../../../domain/geography.model';
import { bs } from '../../../domain/format';
import { Notices } from '../../../layout/notices';

const COLUMNS: readonly ArenaTableColumn[] = [
  { header: 'Ciudad' },
  { header: 'Zonas', align: 'right' },
  { header: 'Clima ahora' },
  { header: 'Marcar', align: 'right', mobileLayout: 'block' },
];

@Component({
  selector: 'app-platform-weather',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [ArenaPageHead, ArenaAlert, ArenaSwitch, ArenaTable, ArenaTableRow, ArenaTableCell],
  templateUrl: './weather.html',
})
export class PlatformWeather {
  private readonly notices = inject(Notices);
  private readonly platform = inject(Platform);

  protected readonly geography = inject(Geography);

  protected readonly columns = COLUMNS;

  protected readonly fee = computed(() => bs(this.platform.weatherFeeBob()));

  protected readonly adverse = computed(() =>
    this.geography.all().filter((one) => one.weather === 'adverso'),
  );

  protected labelOf(city: City): string {
    return weatherLabel(city.weather);
  }

  protected isAdverse(city: City): boolean {
    return city.weather === 'adverso';
  }

  protected toggle(city: City): void {
    const next = this.isAdverse(city) ? 'normal' : 'adverso';

    this.geography.setWeather(city.id, next);
    this.notices.weatherChanged(city.name, next === 'adverso');
  }
}
