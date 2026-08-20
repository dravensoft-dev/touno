import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { BRANCHES, COMPANIES } from '../src/app/domain/businesses.data';
import { pathOfType } from '../src/app/domain/businesses.model';
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
  { path: '/riders', priority: '0.6', changefreq: 'monthly' },
  ...COMPANIES.map((company) => ({
    path: `/${pathOfType(company.type)}/${company.slug}`,
    priority: '0.8',
    changefreq: 'daily',
  })),
  ...BRANCHES.map((branch) => {
    const company = COMPANIES.find((one) => one.id === branch.companyId);

    return {
      path: `/${pathOfType(company?.type ?? 'restaurante')}/${company?.slug}/${branch.slug}`,
      priority: '0.7',
      changefreq: 'daily',
    };
  }),
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
