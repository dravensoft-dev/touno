import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { GeoPoint } from '../../domain/geography.model';
import { StreetSegment } from '../../domain/tracking.model';
import { hhmm } from '../../domain/format';

const PADDING = 14;
const RATIO = 1.5;

@Component({
  selector: 'app-route-map',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  templateUrl: './route-map.html',
  styleUrl: './route-map.css',
})
export class RouteMap {
  readonly label = input.required<string>();
  readonly origin = input.required<GeoPoint>();
  readonly destination = input.required<GeoPoint>();
  readonly route = input<readonly GeoPoint[]>([]);
  readonly streets = input<readonly StreetSegment[]>([]);
  readonly rider = input<GeoPoint>();
  readonly stale = input(false);
  readonly lastSeenAt = input<string>();
  readonly originLabel = input('Origen');
  readonly destinationLabel = input('Destino');
  readonly riderLabel = input('Rider');

  protected readonly viewBox = computed(() => {
    const points = [this.origin(), this.destination(), ...this.route()];
    const rider = this.rider();

    if (rider) {
      points.push(rider);
    }

    const left = Math.min(...points.map((one) => one.x)) - PADDING;
    const right = Math.max(...points.map((one) => one.x)) + PADDING;
    const top = Math.min(...points.map((one) => one.y)) - PADDING;
    const bottom = Math.max(...points.map((one) => one.y)) + PADDING;

    let width = right - left;
    let height = bottom - top;
    let x = left;
    let y = top;

    if (width / height < RATIO) {
      const grown = height * RATIO;
      x -= (grown - width) / 2;
      width = grown;
    } else {
      const grown = width / RATIO;
      y -= (grown - height) / 2;
      height = grown;
    }

    return `${round(x)} ${round(y)} ${round(width)} ${round(height)}`;
  });

  protected readonly line = computed(() =>
    this.route()
      .map((one) => `${one.x},${one.y}`)
      .join(' '),
  );

  protected readonly travelled = computed(() => {
    const rider = this.rider();
    const route = this.route();

    if (!rider) {
      return '';
    }

    const reached = route.findIndex((one) => one.x === rider.x && one.y === rider.y);
    const walked = reached < 0 ? [rider] : route.slice(0, reached + 1);

    return walked.map((one) => `${one.x},${one.y}`).join(' ');
  });

  protected readonly lastSeenText = computed(() => {
    const at = this.lastSeenAt();

    return at ? `Última conexión registrada · ${hhmm(at)}` : 'Última conexión registrada';
  });

  protected readonly summary = computed(() => {
    const rider = this.rider();

    if (!rider) {
      return `Recorrido de ${this.originLabel()} a ${this.destinationLabel()}.`;
    }

    if (this.stale()) {
      return `${this.riderLabel()} dejó de enviar su ubicación. ${this.lastSeenText()}.`;
    }

    return `${this.riderLabel()} va en camino de ${this.originLabel()} a ${this.destinationLabel()}.`;
  });
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
