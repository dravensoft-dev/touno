import { routes } from './app.routes';
import { serverRoutes } from './app.routes.server';

function paramsOf(path: string): readonly string[] {
  return path
    .split('/')
    .filter((one) => one.startsWith(':'))
    .map((one) => one.slice(1))
    .sort();
}

const dynamic = routes.filter((one) => (one.path ?? '').includes(':'));

describe('every route that carries a parameter', () => {
  it('is one the static output actually prerenders', () => {
    expect(dynamic.length).toBeGreaterThan(0);

    for (const route of dynamic) {
      const server = serverRoutes.find((one) => one.path === route.path);

      expect(server, `${route.path} has no entry in app.routes.server.ts`).toBeDefined();
      expect(
        server !== undefined && 'getPrerenderParams' in server,
        `${route.path} is prerendered without getPrerenderParams`,
      ).toBe(true);
    }
  });

  it('is filled under the very names the route declares', async () => {
    for (const route of dynamic) {
      const server = serverRoutes.find((one) => one.path === route.path);
      const fill =
        server !== undefined && 'getPrerenderParams' in server
          ? server.getPrerenderParams
          : undefined;

      if (fill === undefined) {
        continue;
      }

      const rows = await fill();

      expect(rows.length, `${route.path} prerenders no page at all`).toBeGreaterThan(0);

      for (const row of rows) {
        expect(Object.keys(row).sort(), `${route.path} is filled by the wrong name`).toEqual([
          ...paramsOf(route.path ?? ''),
        ]);
      }
    }
  });
});
