import {
  DestroyRef,
  NgZone,
  Signal,
  afterNextRender,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

export const REVEAL_ABOVE = 96;

export const SETTLE_PX = 8;

export interface BarScroll {
  readonly away: boolean;
  readonly at: number;
}

export const AT_TOP: BarScroll = { away: false, at: 0 };

export function nextBarScroll(held: BarScroll, y: number): BarScroll {
  if (y <= REVEAL_ABOVE) {
    return held.away || held.at !== 0 ? AT_TOP : held;
  }

  if (y > held.at + SETTLE_PX) {
    return { away: true, at: y };
  }

  if (y < held.at - SETTLE_PX) {
    return { away: false, at: y };
  }

  return held;
}

export function scrollAway(): Signal<boolean> {
  const router = inject(Router);
  const zone = inject(NgZone);
  const destroyRef = inject(DestroyRef);
  const held = signal(AT_TOP);

  afterNextRender(() => {
    const onScroll = (): void => held.update((one) => nextBarScroll(one, window.scrollY));

    zone.runOutsideAngular(() => window.addEventListener('scroll', onScroll, { passive: true }));
    destroyRef.onDestroy(() => window.removeEventListener('scroll', onScroll));

    router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(destroyRef),
      )
      .subscribe(() => held.set({ away: false, at: window.scrollY }));
  });

  return computed(() => held().away);
}
