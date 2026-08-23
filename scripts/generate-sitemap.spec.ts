import { routes } from '../src/app/app.routes';
import { serverRoutes } from '../src/app/app.routes.server';
import { SITE_ORIGIN } from '../src/app/seo/site';
import { sitemapEntries, sitemapXml } from './generate-sitemap';

function robotsOf(route: (typeof routes)[number]): string {
  const data = (route.data ?? {}) as Record<string, unknown>;
  const found = Object.values(data).find(
    (one) => typeof one === 'object' && one !== null && 'robots' in one,
  ) as { robots?: string } | undefined;

  return found?.robots ?? 'index,follow';
}

function fill(path: string, row: Record<string, string>): string {
  return path
    .split('/')
    .map((segment) => (segment.startsWith(':') ? (row[segment.slice(1)] ?? segment) : segment))
    .join('/');
}

async function indexablePaths(): Promise<string[]> {
  const found: string[] = [];

  for (const route of routes) {
    const path = route.path ?? '';

    if (path === '**' || !robotsOf(route).startsWith('index')) {
      continue;
    }

    if (!path.includes(':')) {
      found.push(`/${path}`.replace(/^\/\/$/, '/'));
      continue;
    }

    const server = serverRoutes.find((one) => one.path === path);
    const params =
      server !== undefined && 'getPrerenderParams' in server
        ? await server.getPrerenderParams()
        : [];

    for (const row of params) {
      found.push(`/${fill(path, row)}`);
    }
  }

  return found.sort();
}

describe('the sitemap', () => {
  it('carries one entry per prerendered page that says index,follow', async () => {
    const declared = [...new Set(await indexablePaths())].sort();
    const written = sitemapEntries()
      .map((entry) => entry.path)
      .sort();

    expect(declared.length).toBeGreaterThan(0);
    expect(written).toEqual(declared);
  });

  it('has no entry a router could not match', async () => {
    const declared = new Set(await indexablePaths());

    for (const entry of sitemapEntries()) {
      expect(
        declared.has(entry.path),
        `${entry.path} is in the sitemap and in no public route`,
      ).toBe(true);
    }
  });

  it('writes every loc against the configured origin', () => {
    const xml = sitemapXml(sitemapEntries(), '2026-01-01');

    for (const entry of sitemapEntries()) {
      expect(xml).toContain(`<loc>${SITE_ORIGIN}${entry.path}</loc>`);
    }
  });

  it('names a route nobody has to count by hand', () => {
    expect(sitemapEntries().length).toBe(new Set(sitemapEntries().map((one) => one.path)).size);
  });
});
