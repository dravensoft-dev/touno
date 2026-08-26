import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { MANUAL } from '../src/app/domain/manual.data';
import { SITE_ORIGIN } from '../src/app/seo/site';

export interface SitemapEntry {
  readonly path: string;
  readonly priority: string;
  readonly changefreq: string;
}

export function sitemapEntries(): SitemapEntry[] {
  return [
    { path: '/', priority: '1.0', changefreq: 'daily' },
    { path: '/riders', priority: '0.6', changefreq: 'monthly' },
    { path: '/manual', priority: '0.6', changefreq: 'monthly' },
    ...MANUAL.map((one) => ({
      path: `/manual/${one.role}`,
      priority: '0.5',
      changefreq: 'monthly',
    })),
  ];
}

export function sitemapXml(entries: readonly SitemapEntry[], lastmod: string): string {
  const body = entries
    .map((entry) =>
      [
        '  <url>',
        `    <loc>${SITE_ORIGIN}${entry.path}</loc>`,
        `    <lastmod>${lastmod}</lastmod>`,
        `    <changefreq>${entry.changefreq}</changefreq>`,
        `    <priority>${entry.priority}</priority>`,
        '  </url>',
      ].join('\n'),
    )
    .join('\n');

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    body,
    '</urlset>',
    '',
  ].join('\n');
}

export function main(): void {
  const entries = sitemapEntries();
  const lastmod = new Date().toISOString().slice(0, 10);

  writeFileSync(join(process.cwd(), 'public', 'sitemap.xml'), sitemapXml(entries, lastmod), 'utf8');
  process.stdout.write(`sitemap: ${entries.length} routes\n`);
}

if ((process.argv[1] ?? '').endsWith('generate-sitemap.ts')) main();
