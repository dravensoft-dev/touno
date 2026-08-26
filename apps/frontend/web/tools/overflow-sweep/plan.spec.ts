import { BRANCHES, COMPANIES } from '../../src/app/domain/businesses.data';
import { pathOfType } from '../../src/app/domain/businesses.model';
import { ORDERS } from '../../src/app/domain/orders.data';
import { RIDERS } from '../../src/app/domain/riders.data';
import { PROFILES } from '../../src/app/domain/session';
import { routes } from '../../src/app/app.routes';
import { PlannedRoute, sweepPlan } from './plan';

const plan = sweepPlan();

function forProfile(id: string): readonly PlannedRoute[] {
  const target = plan.find((one) => one.id === id);

  expect(target, `no profile ${id} in the plan`).toBeDefined();

  return target?.routes ?? [];
}

function withPattern(id: string, pattern: string): readonly PlannedRoute[] {
  return forProfile(id).filter((one) => one.pattern === pattern);
}

function matches(path: string): boolean {
  const wanted = path.split('/').filter(Boolean);

  return routes.some((route) => {
    if (route.path === undefined || route.path === '**') {
      return false;
    }

    const parts = route.path.split('/').filter(Boolean);

    return (
      parts.length === wanted.length &&
      parts.every((part, at) => part.startsWith(':') || part === wanted[at])
    );
  });
}

describe('sweepPlan', () => {
  it('walks the anonymous visitor before it signs in as anyone', () => {
    expect(plan[0]?.id).toBe('anon');
    expect(plan[0]?.button).toBeUndefined();
  });

  it('walks every profile the gate offers, and none of them twice', () => {
    const walked = plan.map((one) => one.id);

    for (const profile of PROFILES) {
      expect(walked, `${profile.id} is offered at the gate and never swept`).toContain(profile.id);
    }

    expect(new Set(walked).size).toBe(walked.length);
  });

  it('covers every page the sitemap asks Google to index', () => {
    const walked = new Set(forProfile('anon').map((one) => one.path));
    const indexed = [
      ...COMPANIES.map((one) => `/${pathOfType(one.type)}/${one.slug}`),
      ...BRANCHES.map((branch) => {
        const company = COMPANIES.find((one) => one.id === branch.companyId);

        return `/${pathOfType(company?.type ?? 'restaurante')}/${company?.slug}/${branch.slug}`;
      }),
    ];

    for (const path of indexed) {
      expect(walked.has(path), `${path} is indexed and never swept`).toBe(true);
    }
  });

  it('signs in by the whole button, so a rider is never taken for a rider con camión', () => {
    expect(plan.find((one) => one.id === 'p-rider')?.button).toBe('Rider · Marco Quispe');
    expect(plan.find((one) => one.id === 'p-rider-camion')?.button).toBe(
      'Rider con camión · Hugo Barrientos',
    );
  });

  it('opens the two encargos that are Marco s and exactly one that is not', () => {
    const planned = withPattern('p-rider', '/rider/encargos/:codigo');
    const mine = planned.filter((one) => one.shows === 'record');
    const refused = planned.filter((one) => one.shows === 'refusal');

    expect(mine).toHaveLength(2);
    expect(refused).toHaveLength(1);

    for (const route of mine) {
      const order = ORDERS.find((one) => route.path.endsWith(`/${one.slug}`));

      expect(order?.assignments.some((one) => one.riderId === 'r-marco')).toBe(true);
    }
  });

  it('reaches a rider of the empresa by slug, because the page resolves by slug', () => {
    const planned = withPattern('p-empresa-restaurante', '/empresa/riders/:slug');
    const slugs = new Set(RIDERS.map((one) => one.slug));

    expect(planned.length).toBeGreaterThan(0);

    for (const route of planned) {
      expect(slugs.has(route.path.split('/').at(-1) ?? '')).toBe(true);
    }
  });

  it('counts a pedido arriving at the sucursal, not only one leaving it', () => {
    const planned = withPattern('p-sucursal-importadora', '/sucursal/pedidos/:codigo');
    const mine = planned.filter((one) => one.shows === 'record');
    const arriving = mine.some((route) =>
      ORDERS.some(
        (one) => route.path.endsWith(`/${one.slug}`) && one.destinationBranchId === 'b-ale-la-paz',
      ),
    );

    expect(arriving).toBe(true);
  });

  it('draws every refusal state once and never twice', () => {
    for (const profile of plan) {
      const perPattern = new Map<string, number>();

      for (const route of profile.routes.filter((one) => one.shows === 'refusal')) {
        perPattern.set(route.pattern, (perPattern.get(route.pattern) ?? 0) + 1);
      }

      for (const [pattern, count] of perPattern) {
        expect(count, `${profile.id} draws ${pattern} refused ${count} times`).toBe(1);
      }
    }
  });

  it('plans no path the router cannot match', () => {
    for (const profile of plan) {
      for (const path of [...profile.routes.map((one) => one.path), profile.fill?.path ?? '/']) {
        expect(matches(path), `${path} matches no route`).toBe(true);
      }
    }
  });

  it('fills the cart on a sucursal that is open, because a closed one draws no Agregar', () => {
    const filling = plan.filter((one) => one.fill !== undefined);

    expect(filling.map((one) => one.id)).toEqual(['anon-carrito', 'p-comprador-carrito']);

    for (const profile of filling) {
      const slug = profile.fill?.path.split('/').at(-1);
      const branch = BRANCHES.find((one) => one.slug === slug);

      expect(profile.fill?.button).toBe('Agregar');
      expect(branch?.open, `${slug} is closed, so its Agregar is disabled`).toBe(true);
    }
  });

  it('walks the filled cart signed out and signed in, which are the two shapes of the bar', () => {
    expect(plan.find((one) => one.id === 'anon-carrito')?.button).toBeUndefined();
    expect(plan.find((one) => one.id === 'p-comprador-carrito')?.button).toBe(
      'Compradora · Rosa Villca',
    );
  });
});
