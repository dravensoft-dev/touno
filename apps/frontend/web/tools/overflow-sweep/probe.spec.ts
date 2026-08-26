import { pageProbe } from './probe';

function afterFrames(count: number, run: () => void): void {
  let seen = 0;
  const step = () => {
    if (++seen >= count) {
      run();
    } else {
      requestAnimationFrame(step);
    }
  };

  requestAnimationFrame(step);
}

describe('pageProbe settle', () => {
  it('resolves only once the layout has stopped changing', async () => {
    document.body.innerHTML = '<p id="target">x</p>';

    const target = document.querySelector('#target') as HTMLElement;
    let growing = true;
    let step = 0;
    const grow = () => {
      if (step < 4) {
        target.textContent = 'x'.repeat(++step * 20);
        requestAnimationFrame(grow);
      } else {
        growing = false;
      }
    };

    requestAnimationFrame(grow);

    const result = await pageProbe({ kind: 'settle', frames: 2, maxMs: 2000 });

    expect(growing).toBe(false);
    expect(result.timedOut).toBe(false);
  });

  it('gives up after maxMs when the page never holds still', async () => {
    document.body.innerHTML = '<p id="target">x</p>';

    const target = document.querySelector('#target') as HTMLElement;
    let churning = true;
    let step = 0;
    const churn = () => {
      if (!churning) {
        return;
      }

      target.textContent = 'x'.repeat(++step);
      requestAnimationFrame(churn);
    };

    requestAnimationFrame(churn);

    const result = await pageProbe({ kind: 'settle', frames: 2, maxMs: 120 });

    churning = false;

    expect(result.timedOut).toBe(true);
    expect(result.ms).toBeGreaterThanOrEqual(120);
  });
});

describe('pageProbe navigate', () => {
  let listener: (() => void) | undefined;

  afterEach(() => {
    if (listener) {
      removeEventListener('popstate', listener);
      listener = undefined;
    }
  });

  it('settles at once when it is already standing on the path it was asked for', async () => {
    document.body.innerHTML = '<main>el turno</main>';
    history.pushState({}, '', '/rider/turno');

    const result = await pageProbe({
      kind: 'navigate',
      path: '/rider/turno',
      frames: 2,
      maxMs: 400,
    });

    expect(result.timedOut).toBe(false);
    expect(result.ms).toBeLessThan(400);
  });

  it('waits for what the new route drew, not for the page it left', async () => {
    document.body.innerHTML = '<main>antes</main>';

    const main = document.querySelector('main') as HTMLElement;
    let popped = 0;

    listener = () => {
      popped++;
      afterFrames(5, () => {
        main.textContent = 'después';
      });
    };

    addEventListener('popstate', listener);

    const result = await pageProbe({
      kind: 'navigate',
      path: '/sucursal/pedidos',
      frames: 2,
      maxMs: 2000,
    });

    expect(location.pathname).toBe('/sucursal/pedidos');
    expect(popped).toBe(1);
    expect(main.textContent).toBe('después');
    expect(result.timedOut).toBe(false);
  });
});
