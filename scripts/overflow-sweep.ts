import { existsSync } from 'node:fs';
import type { Page } from 'playwright-core';
import { AGREEMENTS } from '../src/app/domain/agreements.data';
import { BRANCHES } from '../src/app/domain/businesses.data';
import { PRODUCTS } from '../src/app/domain/catalog.data';
import { TRUCK_LOADS } from '../src/app/domain/loads.data';
import { ORDERS } from '../src/app/domain/orders.data';
import { RIDERS } from '../src/app/domain/riders.data';
import { PROFILES, Profile } from '../src/app/domain/session';
import { PANELS, destinationsFor, panelFor } from '../src/app/layout/panel-nav';
import { ProbeCommand, Settled, pageProbe } from './overflow-sweep/probe';

const BASE = process.env['SWEEP_BASE'] ?? 'http://localhost:4173';
const WIDTHS = [320, 360, 390, 768, 1024, 1440];
const BROWSERS = [
  process.env['CHROME'],
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/usr/bin/google-chrome',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
];

const PUBLIC_ROUTES = ['/', '/restaurantes', '/tiendas', '/riders', '/ingresar'];

const STILL_FRAMES = 2;
const SETTLE_MS = 600;

interface Finding {
  readonly profileId: string;
  readonly route: string;
  readonly width: number;
  readonly over: number;
  readonly culprits: readonly string[];
}

function railOf(profile: Profile): readonly string[] {
  const panel = panelFor(profile.home) ?? PANELS.find((one) => one.role === profile.role);

  return panel ? destinationsFor(panel, profile.businessType).map((one) => one.path) : [];
}

function detailsOf(profile: Profile): readonly string[] {
  const slugs = ORDERS.map((one) => one.slug);

  if (profile.role === 'comprador') {
    return ['/carrito/entrega', ...slugs.map((slug) => `/mis-pedidos/${slug}`)];
  }

  if (profile.role === 'rider') {
    return [
      ...slugs.map((slug) => `/rider/encargos/${slug}`),
      ...slugs.map((slug) => `/rider/encargos/${slug}/escanear`),
      ...AGREEMENTS.map((one) => `/rider/acuerdos/${one.id}`),
      ...TRUCK_LOADS.map((one) => `/rider/cargas/${one.id}`),
    ];
  }

  const catalogue = profile.businessType === 'restaurante' ? 'carta' : 'catalogo';
  const mine = PRODUCTS.filter((one) => one.companyId === profile.companyId).map((one) => one.id);

  if (profile.role === 'gerente-empresa') {
    return [
      ...BRANCHES.map((one) => `/empresa/sucursales/${one.id}`),
      ...RIDERS.map((one) => `/empresa/riders/${one.id}`),
      ...mine.map((id) => `/empresa/${catalogue}/${id}`),
    ];
  }

  return [
    ...slugs.map((slug) => `/sucursal/pedidos/${slug}`),
    ...mine.map((id) => `/sucursal/${catalogue}/${id}`),
  ];
}

function measure() {
  const root = document.documentElement;
  const viewport = root.clientWidth;
  const over = root.scrollWidth - viewport;

  if (over <= 0) {
    return { over: 0, culprits: [] as string[] };
  }

  const describe = (element: Element): string => {
    const parts: string[] = [];

    for (let node: Element | null = element; node && parts.length < 4; node = node.parentElement) {
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

  const culprits = new Set<string>();

  for (const element of document.querySelectorAll('body *')) {
    const box = element.getBoundingClientRect();

    if (box.width === 0 && box.height === 0) {
      continue;
    }

    if (box.right > viewport + 1 && !scoped(element)) {
      culprits.add(`${describe(element)} right=${Math.round(box.right)}`);
    }
  }

  return { over, culprits: [...culprits].slice(0, 6) };
}

const { chromium } = await import('playwright-core');
const executablePath = BROWSERS.find((one): one is string => !!one && existsSync(one));

if (!executablePath) {
  process.stderr.write('overflow-sweep: no Chrome found, set CHROME to its path\n');
  process.exit(1);
}

const reachable = await fetch(`${BASE}/ingresar/`)
  .then((response) => response.ok)
  .catch(() => false);

if (!reachable) {
  process.stderr.write(`overflow-sweep: nothing serving ${BASE}, run bun run serve:static\n`);
  process.exit(1);
}

const browser = await chromium.launch({ executablePath });
const findings: Finding[] = [];
let visited = 0;
let measured = 0;
let impatient = 0;

async function settle(page: Page, command: ProbeCommand): Promise<Settled> {
  const result = await page.evaluate(pageProbe, command);

  if (result.timedOut) {
    impatient++;
  }

  return result;
}

for (const profile of [undefined, ...PROFILES] as readonly (Profile | undefined)[]) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const id = profile?.id ?? 'anon';

  await page.goto(`${BASE}/ingresar/`, { waitUntil: 'networkidle' });

  if (profile) {
    await page.locator('button', { hasText: profile.label }).first().click();
    await settle(page, { kind: 'settle', frames: STILL_FRAMES, maxMs: SETTLE_MS });
  }

  const routes = profile ? [...railOf(profile), ...detailsOf(profile)] : PUBLIC_ROUTES;

  for (const route of routes) {
    await settle(page, {
      kind: 'navigate',
      path: route,
      frames: STILL_FRAMES,
      maxMs: SETTLE_MS,
    });
    visited++;

    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: 900 });
      await settle(page, { kind: 'settle', frames: STILL_FRAMES, maxMs: SETTLE_MS });

      const result = await page.evaluate(measure);

      measured++;

      if (result.over > 0) {
        findings.push({
          profileId: id,
          route,
          width,
          over: result.over,
          culprits: result.culprits,
        });
        process.stdout.write(`overflow-sweep: ${id} ${route} @${width} +${result.over}px\n`);

        for (const culprit of result.culprits) {
          process.stdout.write(`    ${culprit}\n`);
        }
      }
    }

    await page.setViewportSize({ width: 1440, height: 900 });
  }

  process.stdout.write(`overflow-sweep: ${id}, ${routes.length} route(s)\n`);
  await context.close();
}

await browser.close();

if (visited === 0) {
  process.stderr.write('overflow-sweep: no route was visited\n');
  process.exit(1);
}

process.stdout.write(
  `overflow-sweep: ${measured} measurement(s) over ${visited} page(s), ${findings.length} overflow(s)\n`,
);

if (impatient > 0) {
  process.stdout.write(`overflow-sweep: ${impatient} wait(s) hit the ${SETTLE_MS}ms ceiling\n`);
}
process.exit(findings.length > 0 ? 1 : 0);
