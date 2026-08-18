import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { MERCHANTS } from '../src/app/domain/marketplace.data';
import { SHIPMENTS } from '../src/app/domain/shipping.data';
import { SITE_ORIGIN } from '../src/app/seo/site';

interface SitemapEntry {
  readonly path: string;
  readonly priority: string;
  readonly changefreq: string;
}

const entries: SitemapEntry[] = [
  { path: '/', priority: '1.0', changefreq: 'daily' },
  { path: '/restaurantes', priority: '0.9', changefreq: 'daily' },
  { path: '/tiendas', priority: '0.9', changefreq: 'daily' },
  { path: '/tarifas', priority: '0.7', changefreq: 'weekly' },
  { path: '/conducir', priority: '0.6', changefreq: 'monthly' },
  ...MERCHANTS.map((merchant) => ({
    path: `/${merchant.kind === 'restaurante' ? 'restaurantes' : 'tiendas'}/${merchant.slug}`,
    priority: '0.8',
    changefreq: 'daily',
  })),
  ...SHIPMENTS.filter((shipment) => shipment.publicTracking).map((shipment) => ({
    path: `/seguimiento/${shipment.slug}`,
    priority: '0.4',
    changefreq: 'hourly',
  })),
];

const lastmod = new Date().toISOString().slice(0, 10);

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

const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  body,
  '</urlset>',
  '',
].join('\n');

writeFileSync(join(process.cwd(), 'public', 'sitemap.xml'), sitemap, 'utf8');
process.stdout.write(`sitemap: ${entries.length} routes\n`);
