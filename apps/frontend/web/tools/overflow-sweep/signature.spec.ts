import { pageProbe } from './probe';

const signature = async (): Promise<string> => {
  const result = await pageProbe({ kind: 'settle', frames: 0, maxMs: 500 });

  return result.signature;
};

describe('pageProbe signature', () => {
  it('holds steady when the same markup is drawn again', async () => {
    document.body.innerHTML = '<p class="one">hola</p>';

    const before = await signature();

    document.body.innerHTML = '<p class="one">hola</p>';

    expect(await signature()).toBe(before);
  });

  it('tells apart two pages of the very same length', async () => {
    document.body.innerHTML = '<p>ab</p>';

    const before = await signature();

    document.body.innerHTML = '<p>ba</p>';

    expect(await signature()).not.toBe(before);
  });

  it('tells apart the same body under a different theme', async () => {
    document.body.innerHTML = '<p>hola</p>';
    document.documentElement.className = '';

    const light = await signature();

    document.documentElement.className = 'arena-noche';

    expect(await signature()).not.toBe(light);

    document.documentElement.className = '';
  });
});
