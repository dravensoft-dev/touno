import { Injectable, signal } from '@angular/core';
import { minutesSince } from './clock';
import { GeoPoint } from './geography.model';
import { CityMap, RiderTrack, STALE_AFTER_MINUTES, StreetSegment } from './tracking.model';
import { CITY_MAPS, RIDER_TRACKS } from './tracking.data';

@Injectable({ providedIn: 'root' })
export class Tracking {
  private readonly trackList = signal<readonly RiderTrack[]>(RIDER_TRACKS);

  readonly all = this.trackList.asReadonly();

  readonly maps: readonly CityMap[] = CITY_MAPS;

  ofOrder(code: string): RiderTrack | undefined {
    return this.all().find((one) => one.orderCode === code);
  }

  streetsOf(cityId: string): readonly StreetSegment[] {
    return this.maps.find((one) => one.cityId === cityId)?.streets ?? [];
  }

  lastPoint(code: string): GeoPoint | undefined {
    const pings = this.ofOrder(code)?.pings ?? [];

    return pings[pings.length - 1]?.point;
  }

  isStale(code: string): boolean {
    const track = this.ofOrder(code);

    return track ? minutesSince(track.lastPingAt) > STALE_AFTER_MINUTES : false;
  }

  silentFor(code: string): number {
    const track = this.ofOrder(code);

    return track ? Math.max(0, minutesSince(track.lastPingAt)) : 0;
  }

  report(code: string, point: GeoPoint, at: string): void {
    this.trackList.update((list) =>
      list.map((one) =>
        one.orderCode === code
          ? { ...one, pings: [...one.pings, { at, point }], lastPingAt: at }
          : one,
      ),
    );
  }
}
