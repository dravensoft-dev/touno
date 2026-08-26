import { Measured, pageProbe } from './probe';

function viewport(clientWidth: number, scrollWidth: number): void {
  Object.defineProperty(document.documentElement, 'clientWidth', {
    value: clientWidth,
    configurable: true,
  });
  Object.defineProperty(document.documentElement, 'scrollWidth', {
    value: scrollWidth,
    configurable: true,
  });
}

function box(element: Element, right: number, width = 40, height = 20): void {
  element.getBoundingClientRect = () =>
    ({
      right,
      width,
      height,
      left: right - width,
      top: 0,
      bottom: height,
      x: right - width,
      y: 0,
      toJSON: () => ({}),
    }) as DOMRect;
}

async function measure(culprits = 6): Promise<Measured> {
  const result = await pageProbe({ kind: 'measure', culprits });

  if (result.kind !== 'measured') {
    throw new Error('the measure command answered with something else');
  }

  return result;
}

describe('pageProbe measure', () => {
  it('reports nothing when the document is no wider than the viewport', async () => {
    document.body.innerHTML = '<div class="wrap"><p>hola</p></div>';
    viewport(390, 390);

    const result = await measure();

    expect(result.over).toBe(0);
    expect(result.culprits).toEqual([]);
  });

  it('reports how far the document runs past the right edge', async () => {
    document.body.innerHTML = '<div class="wrap"></div>';
    viewport(390, 431);

    expect((await measure()).over).toBe(41);
  });

  it('names the element that crosses the edge and where it sits', async () => {
    document.body.innerHTML = '<div class="wrap arena-band"><table class="sheet"></table></div>';
    viewport(390, 500);
    box(document.querySelector('.sheet') as Element, 500);

    const [culprit] = (await measure()).culprits;

    expect(culprit).toContain('table.sheet');
    expect(culprit).toContain('div.wrap.arena-band');
    expect(culprit).toContain('right=500');
  });

  it('keeps quiet about an element inside a container that declares overflow-x', async () => {
    document.body.innerHTML =
      '<div class="wrap" style="overflow-x: auto"><table class="sheet"></table></div>';
    viewport(390, 500);
    box(document.querySelector('.sheet') as Element, 500);

    expect((await measure()).culprits).toEqual([]);
  });

  it('ignores an element that draws no box at all', async () => {
    document.body.innerHTML = '<div class="wrap"><span class="ghost"></span></div>';
    viewport(390, 500);
    box(document.querySelector('.ghost') as Element, 900, 0, 0);

    expect((await measure()).culprits).toEqual([]);
  });

  it('names no more culprits than it was asked for', async () => {
    document.body.innerHTML = Array.from(
      { length: 9 },
      (_, at) => `<div class="wide-${at}"></div>`,
    ).join('');
    viewport(390, 900);

    for (let at = 0; at < 9; at++) {
      box(document.querySelector(`.wide-${at}`) as Element, 500 + at);
    }

    expect((await measure(3)).culprits).toHaveLength(3);
  });
});
