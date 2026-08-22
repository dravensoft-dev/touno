import { existsSync } from 'node:fs';
import type { Page } from 'playwright-core';
import { sweepPlan } from './overflow-sweep/plan';
import { ProbeCommand, Settled, pageProbe } from './overflow-sweep/probe';
import { SeenPages } from './overflow-sweep/seen';

const BASE = process.env['SWEEP_BASE'] ?? 'http://localhost:4173';
const WIDTHS = [320, 360, 390, 768, 1024, 1440];
const BROWSERS = [
  process.env['CHROME'],
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/usr/bin/google-chrome',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
];

const WIDEST = WIDTHS[WIDTHS.length - 1] ?? 1440;

const STILL_FRAMES = 2;
const SETTLE_MS = 600;

interface Finding {
  readonly profileId: string;
  readonly route: string;
  readonly width: number;
  readonly over: number;
  readonly culprits: readonly string[];
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
const seen = new SeenPages();
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

for (const target of sweepPlan()) {
  const context = await browser.newContext({ viewport: { width: WIDEST, height: 900 } });
  const page = await context.newPage();
  const id = target.id;

  await page.goto(`${BASE}/ingresar/`, { waitUntil: 'networkidle' });

  if (target.button !== undefined) {
    await page.locator('button', { hasText: target.button }).first().click();
    await settle(page, { kind: 'settle', frames: STILL_FRAMES, maxMs: SETTLE_MS });
  }

  for (const planned of target.routes) {
    const route = planned.path;
    const arrived = await settle(page, {
      kind: 'navigate',
      path: route,
      frames: STILL_FRAMES,
      maxMs: SETTLE_MS,
    });

    visited++;

    const twin = seen.claim(arrived.signature, `${id} ${route}`);

    if (twin !== undefined) {
      continue;
    }

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
  }

  process.stdout.write(`overflow-sweep: ${id}, ${target.routes.length} route(s)\n`);
  await context.close();
}

await browser.close();

if (visited === 0) {
  process.stderr.write('overflow-sweep: no route was visited\n');
  process.exit(1);
}

process.stdout.write(
  `overflow-sweep: ${measured} measurement(s) over ${seen.size} distinct page(s) of ${visited} visited, ${findings.length} overflow(s)\n`,
);

if (seen.repeats > 0) {
  process.stdout.write(
    `overflow-sweep: ${seen.repeats} visit(s) drew a page already measured, so their widths were skipped\n`,
  );
}

if (impatient > 0) {
  process.stdout.write(`overflow-sweep: ${impatient} wait(s) hit the ${SETTLE_MS}ms ceiling\n`);
}
process.exit(findings.length > 0 ? 1 : 0);
