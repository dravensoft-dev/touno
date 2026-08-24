import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { GeoPoint } from '../../domain/geography.model';
import { StreetSegment } from '../../domain/tracking.model';
import { unitsBetween } from '../../domain/pricing';
import { frameOf } from '../map-frame';

export interface NearbyPlace {
  readonly id: string;
  readonly label: string;
  readonly point: GeoPoint;
  readonly cuposLeft: number;
}

@Component({
  selector: 'app-nearby-map',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  templateUrl: './nearby-map.html',
  styleUrl: './nearby-map.css',
})
export class NearbyMap {
  readonly label = input.required<string>();
  readonly here = input.required<GeoPoint>();
  readonly places = input<readonly NearbyPlace[]>([]);
  readonly streets = input<readonly StreetSegment[]>([]);
  readonly hereLabel = input('Tú');

  protected readonly viewBox = computed(() =>
    frameOf([this.here(), ...this.places().map((one) => one.point)]),
  );

  protected readonly nearest = computed<NearbyPlace | undefined>(() => {
    const here = this.here();

    return this.places()
      .slice()
      .sort(
        (left, right) =>
          unitsBetween(here, left.point) - unitsBetween(here, right.point) ||
          left.label.localeCompare(right.label),
      )[0];
  });

  protected readonly summary = computed(() => {
    const nearest = this.nearest();

    if (!nearest) {
      return 'Ninguna sucursal cerca de ti está buscando agentes libres ahora.';
    }

    const count = this.places().length;
    const opening =
      count === 1
        ? 'Una sucursal cerca de ti está buscando agentes libres'
        : `${count} sucursales cerca de ti están buscando agentes libres`;
    const cupos =
      nearest.cuposLeft === 1 ? 'le queda un cupo' : `le quedan ${nearest.cuposLeft} cupos`;

    return `${opening}. La más cercana es ${nearest.label}, y ${cupos}.`;
  });
}
