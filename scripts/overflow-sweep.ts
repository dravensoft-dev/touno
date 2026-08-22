import { existsSync } from 'node:fs';
import { PlannedProfile, sweepPlan } from './overflow-sweep/plan';
import { inPool } from './overflow-sweep/pool';
import {
  MeasureCommand,
  Measured,
  NavigateCommand,
  Settled,
  SettleCommand,
  pageProbe,
} from './overflow-sweep/probe';
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
const WORKERS = Math.max(1, Number(process.env['SWEEP_WORKERS'] ?? 4));
const MEASURE: MeasureCommand = { kind: 'measure', culprits: 6 };

const STILL_FRAMES = 2;
const COLD_MS = 2500;
const WARM_MS = 400;

interface Finding {
  readonly profileId: string;
  readonly route: string;
  readonly width: number;
  readonly over: number;
  readonly culprits: readonly string[];
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
const seen = new SeenPages();

interface Walked {
  readonly id: string;
  readonly routes: number;
  readonly visited: number;
  readonly measured: number;
  readonly findings: readonly Finding[];
  readonly impatient: readonly string[];
}

async function walk(target: PlannedProfile): Promise<Walked> {
  const context = await browser.newContext({ viewport: { width: WIDEST, height: 900 } });
  const page = await context.newPage();
  const id = target.id;
  const findings: Finding[] = [];
  const impatient: string[] = [];
  const warm = new Set<string>();
  let visited = 0;
  let measured = 0;

  const settle = async (
    where: string,
    command: SettleCommand | NavigateCommand,
  ): Promise<Settled> => {
    const result = await page.evaluate(pageProbe, command);

    if (result.kind !== 'settled') {
      throw new Error(`overflow-sweep: the probe answered ${result.kind} to a wait`);
    }

    if (result.timedOut) {
      impatient.push(`${where} never held still inside ${command.maxMs}ms`);
    }

    return result;
  };

  const measure = async (): Promise<Measured> => {
    const result = await page.evaluate(pageProbe, MEASURE);

    if (result.kind !== 'measured') {
      throw new Error(`overflow-sweep: the probe answered ${result.kind} to a measurement`);
    }

    return result;
  };

  await page.goto(`${BASE}/ingresar/`, { waitUntil: 'networkidle' });

  if (target.button !== undefined) {
    await page.locator('button', { hasText: target.button }).first().click();
    await settle(`${id} signing in`, { kind: 'settle', frames: STILL_FRAMES, maxMs: COLD_MS });
  }

  for (const planned of target.routes) {
    const route = planned.path;
    const cold = !warm.has(planned.pattern);

    warm.add(planned.pattern);

    const arrived = await settle(`${id} ${route}`, {
      kind: 'navigate',
      path: route,
      frames: STILL_FRAMES,
      maxMs: cold ? COLD_MS : WARM_MS,
    });

    visited++;

    if (seen.claim(arrived.signature, `${id} ${route}`) !== undefined) {
      continue;
    }

    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: 900 });
      await settle(`${id} ${route} @${width}`, {
        kind: 'settle',
        frames: STILL_FRAMES,
        maxMs: WARM_MS,
      });

      const result = await measure();

      measured++;

      if (result.over > 0) {
        findings.push({
          profileId: id,
          route,
          width,
          over: result.over,
          culprits: result.culprits,
        });
      }
    }
  }

  await context.close();
  process.stdout.write(`overflow-sweep: ${id}, ${target.routes.length} route(s)\n`);

  return { id, routes: target.routes.length, visited, measured, findings, impatient };
}

const walked = await inPool(sweepPlan(), WORKERS, walk);

await browser.close();

const findings = walked.flatMap((one) => one.findings);
const impatient = walked.flatMap((one) => one.impatient);
const visited = walked.reduce((total, one) => total + one.visited, 0);
const measured = walked.reduce((total, one) => total + one.measured, 0);

if (visited === 0) {
  process.stderr.write('overflow-sweep: no route was visited\n');
  process.exit(1);
}

for (const finding of findings) {
  process.stdout.write(
    `overflow-sweep: ${finding.profileId} ${finding.route} @${finding.width} +${finding.over}px\n`,
  );

  for (const culprit of finding.culprits) {
    process.stdout.write(`    ${culprit}\n`);
  }
}

process.stdout.write(
  `overflow-sweep: ${measured} measurement(s) over ${seen.size} distinct page(s) of ${visited} visited, ${findings.length} overflow(s)\n`,
);

if (seen.repeats > 0) {
  process.stdout.write(
    `overflow-sweep: ${seen.repeats} visit(s) drew a page already measured, so their widths were skipped\n`,
  );
}

for (const where of impatient) {
  process.stdout.write(`overflow-sweep: ${where}\n`);
}

process.exit(findings.length > 0 ? 1 : 0);
