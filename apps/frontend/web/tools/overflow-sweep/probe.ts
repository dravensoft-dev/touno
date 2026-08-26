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

export interface MeasureCommand {
  readonly kind: 'measure';
  readonly culprits: number;
}

export type ProbeCommand = SettleCommand | NavigateCommand | MeasureCommand;

export interface Settled {
  readonly kind: 'settled';
  readonly ms: number;
  readonly timedOut: boolean;
  readonly signature: string;
}

export interface Measured {
  readonly kind: 'measured';
  readonly over: number;
  readonly culprits: readonly string[];
}

export type ProbeResult = Settled | Measured;

export function pageProbe(command: SettleCommand | NavigateCommand): Promise<Settled>;
export function pageProbe(command: MeasureCommand): Promise<Measured>;
export function pageProbe(command: ProbeCommand): Promise<ProbeResult>;

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

  if (command.kind === 'measure') {
    const viewport = root.clientWidth;
    const over = root.scrollWidth - viewport;

    if (over <= 0) {
      return Promise.resolve({ kind: 'measured', over: 0, culprits: [] });
    }

    const describe = (element: Element): string => {
      const parts: string[] = [];

      for (
        let node: Element | null = element;
        node && parts.length < 4;
        node = node.parentElement
      ) {
        const classes = [...node.classList].slice(0, 2).join('.');

        parts.unshift(
          classes ? `${node.tagName.toLowerCase()}.${classes}` : node.tagName.toLowerCase(),
        );
      }

      return parts.join(' > ');
    };

    const scoped = (element: Element): boolean => {
      for (
        let node = element.parentElement;
        node && node !== document.body;
        node = node.parentElement
      ) {
        const overflowX = getComputedStyle(node).overflowX;

        if (overflowX === 'auto' || overflowX === 'scroll' || overflowX === 'hidden') {
          return true;
        }
      }

      return false;
    };

    const named = new Set<string>();

    for (const element of document.querySelectorAll('body *')) {
      const shape = element.getBoundingClientRect();

      if (shape.width === 0 && shape.height === 0) {
        continue;
      }

      if (shape.right > viewport + 1 && !scoped(element)) {
        named.add(`${describe(element)} right=${Math.round(shape.right)}`);
      }
    }

    return Promise.resolve({
      kind: 'measured',
      over,
      culprits: [...named].slice(0, command.culprits),
    });
  }

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
