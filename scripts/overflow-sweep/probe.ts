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
  readonly signature: string;
}

export type ProbeResult = Settled;

export function pageProbe(command: ProbeCommand): Promise<ProbeResult> {
  const root = document.documentElement;
  const signature = (): string => {
    const text = `${root.scrollWidth}|${root.clientWidth}|${root.className}|${document.body.outerHTML}`;
    let low = 0x811c9dc5;
    let high = 0xcbf29ce4;

    for (let at = 0; at < text.length; at++) {
      const code = text.charCodeAt(at);

      low = Math.imul(low ^ code, 0x01000193) >>> 0;
      high = Math.imul(high + code, 0x85ebca6b) >>> 0;
    }

    return `${low.toString(16)}-${high.toString(16)}`;
  };

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
          resolve({ kind: 'settled', ms: elapsed, timedOut: false, signature: current });

          return;
        }

        if (elapsed >= maxMs) {
          resolve({ kind: 'settled', ms: elapsed, timedOut: true, signature: current });

          return;
        }

        requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
    });

  if (command.kind === 'navigate') {
    const trim = (path: string): string => (path.length > 1 ? path.replace(/\/$/, '') : path);
    const standing = trim(location.pathname) === trim(command.path);
    const leaving = signature();

    history.pushState({}, '', command.path);
    dispatchEvent(new PopStateEvent('popstate', { state: {} }));

    return hold(command.frames, command.maxMs, standing ? undefined : leaving);
  }

  return hold(command.frames, command.maxMs, undefined);
}
