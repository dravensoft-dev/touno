import { TestBed } from '@angular/core/testing';
import { NOW, minutesSince } from './clock';
import { Geography } from './geography';
import { Riders } from './riders';
import { Tracking } from './tracking';
import { STALE_AFTER_MINUTES } from './tracking.model';

describe('Tracking', () => {
  let tracking: Tracking;
  let geography: Geography;
  let riders: Riders;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    tracking = TestBed.inject(Tracking);
    geography = TestBed.inject(Geography);
    riders = TestBed.inject(Riders);
  });

  it('draws a street grid for every city, and only for cities that exist', () => {
    expect(tracking.maps.length).toBeGreaterThan(0);

    for (const map of tracking.maps) {
      expect(geography.byId(map.cityId)).toBeDefined();
      expect(map.streets.length).toBeGreaterThan(0);
    }

    for (const city of geography.all()) {
      expect(tracking.streetsOf(city.id).length).toBeGreaterThan(0);
    }
  });

  it('answers no streets rather than throwing for a city it does not draw', () => {
    expect(tracking.streetsOf('potosi')).toEqual([]);
  });

  it('keeps every coordinate inside the drawing', () => {
    const points = [
      ...tracking.maps.flatMap((one) => one.streets.flatMap((s) => [s.from, s.to])),
      ...tracking.all().flatMap((one) => [one.from, one.to, ...one.route]),
      ...tracking.all().flatMap((one) => one.pings.map((p) => p.point)),
    ];

    for (const point of points) {
      expect(point.x).toBeGreaterThanOrEqual(0);
      expect(point.x).toBeLessThanOrEqual(100);
      expect(point.y).toBeGreaterThanOrEqual(0);
      expect(point.y).toBeLessThanOrEqual(100);
    }
  });

  it('runs every route from its origin to its destination', () => {
    for (const track of tracking.all()) {
      expect(track.route.length).toBeGreaterThan(1);
      expect(track.route[0]).toEqual(track.from);
      expect(track.route[track.route.length - 1]).toEqual(track.to);
      expect(riders.byId(track.riderId)).toBeDefined();
    }
  });

  it('stamps pings in order and ends on the last one', () => {
    for (const track of tracking.all()) {
      const stamps = track.pings.map((one) => one.at);

      expect(track.pings.length).toBeGreaterThan(0);
      expect([...stamps].sort()).toEqual(stamps);
      expect(track.lastPingAt).toBe(stamps[stamps.length - 1]);
      expect(tracking.lastPoint(track.orderCode)).toEqual(
        track.pings[track.pings.length - 1].point,
      );
    }
  });

  it('never reports a ping from the future', () => {
    for (const track of tracking.all()) {
      expect(minutesSince(track.lastPingAt)).toBeGreaterThanOrEqual(0);
    }
  });

  it('carries one rider who went quiet, so the last-seen point is reachable', () => {
    const quiet = tracking.all().filter((one) => tracking.isStale(one.orderCode));

    expect(quiet.length).toBeGreaterThan(0);
    expect(tracking.isStale('TO-1044')).toBe(true);
    expect(tracking.silentFor('TO-1044')).toBeGreaterThan(STALE_AFTER_MINUTES);
  });

  it('carries riders still reporting, so a live map is reachable too', () => {
    expect(tracking.isStale('TO-1043')).toBe(false);
    expect(tracking.isStale('TO-2205')).toBe(false);
  });

  it('says nothing is stale for an order it does not follow', () => {
    expect(tracking.isStale('TO-9999')).toBe(false);
    expect(tracking.silentFor('TO-9999')).toBe(0);
    expect(tracking.lastPoint('TO-9999')).toBeUndefined();
  });

  it('clears the silence by itself when the rider reports again', () => {
    expect(tracking.isStale('TO-1044')).toBe(true);

    tracking.report('TO-1044', { x: 40, y: 84 }, NOW);

    expect(tracking.isStale('TO-1044')).toBe(false);
    expect(tracking.lastPoint('TO-1044')).toEqual({ x: 40, y: 84 });
  });
});
