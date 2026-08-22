export interface SettleCommand {
  readonly kind: 'settle';
  readonly frames: number;
  readonly maxMs: number;
}

export interface NavigateCommand {
  readonly kind: 'navigate';
  readonly path: string;
  readonly frames: number;
  readonly maxMs: number;
}

export type ProbeCommand = SettleCommand | NavigateCommand;

export interface Settled {
  readonly kind: 'settled';
  readonly ms: number;
  readonly timedOut: boolean;
}

export type ProbeResult = Settled;

export function pageProbe(command: ProbeCommand): Promise<ProbeResult> {
  const root = document.documentElement;
  const signature = (): string =>
    `${root.scrollWidth}|${root.clientWidth}|${document.body.innerHTML.length}`;

  const hold = (frames: number, maxMs: number, leaving: string | undefined): Promise<Settled> =>
    new Promise<Settled>((resolve) => {
      const started = performance.now();
      let previous = '';
      let still = 0;

      const tick = (): void => {
        const current = signature();
        const elapsed = performance.now() - started;

        still = current === previous ? still + 1 : 0;
        previous = current;

        if (still >= frames && current !== leaving) {
          resolve({ kind: 'settled', ms: elapsed, timedOut: false });

          return;
        }

        if (elapsed >= maxMs) {
          resolve({ kind: 'settled', ms: elapsed, timedOut: true });

          return;
        }

        requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
    });

  if (command.kind === 'navigate') {
    const leaving = signature();

    history.pushState({}, '', command.path);
    dispatchEvent(new PopStateEvent('popstate', { state: {} }));

    return hold(command.frames, command.maxMs, leaving);
  }

  return hold(command.frames, command.maxMs, undefined);
}
