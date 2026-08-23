import { AGREEMENTS } from '../../src/app/domain/agreements.data';
import { BRANCHES, COMPANIES } from '../../src/app/domain/businesses.data';
import { MANUAL } from '../../src/app/domain/manual.data';
import { pathOfType } from '../../src/app/domain/businesses.model';
import { PRODUCTS } from '../../src/app/domain/catalog.data';
import { TRUCK_LOADS } from '../../src/app/domain/loads.data';
import { ORDERS } from '../../src/app/domain/orders.data';
import { RIDERS } from '../../src/app/domain/riders.data';
import { PROFILES, Profile } from '../../src/app/domain/session';
import { destinationsFor, panelOf } from '../../src/app/layout/panel-nav';

export type Shows = 'record' | 'refusal';

export interface PlannedRoute {
  readonly path: string;
  readonly pattern: string;
  readonly shows: Shows;
}

export interface Fill {
  readonly path: string;
  readonly button: string;
}

export interface PlannedProfile {
  readonly id: string;
  readonly button: string | undefined;
  readonly routes: readonly PlannedRoute[];
  readonly fill?: Fill;
}

interface Records<T> {
  readonly pattern: string;
  readonly all: readonly T[];
  readonly pathOf: (one: T) => string;
  readonly mine: (one: T) => boolean;
}

const STATIC_PUBLIC = ['/', '/restaurantes', '/tiendas', '/riders', '/ingresar', '/manual'];

function plain(path: string): PlannedRoute {
  return { path, pattern: path, shows: 'record' };
}

function open<T>(source: Records<T>): readonly PlannedRoute[] {
  const drawn = source.all
    .filter((one) => source.mine(one))
    .map<PlannedRoute>((one) => ({
      path: source.pathOf(one),
      pattern: source.pattern,
      shows: 'record',
    }));

  const stranger = source.all.find((one) => !source.mine(one));

  return stranger === undefined
    ? drawn
    : [...drawn, { path: source.pathOf(stranger), pattern: source.pattern, shows: 'refusal' }];
}

const ADD_TO_CART = 'Agregar';

function companyOf(branchCompanyId: string) {
  return COMPANIES.find((one) => one.id === branchCompanyId);
}

function publicRoutes(): readonly PlannedRoute[] {
  const companies = COMPANIES.map<PlannedRoute>((one) => ({
    path: `/${pathOfType(one.type)}/${one.slug}`,
    pattern: `/${pathOfType(one.type)}/:empresa`,
    shows: 'record',
  }));

  const branches = BRANCHES.flatMap<PlannedRoute>((branch) => {
    const company = companyOf(branch.companyId);

    if (company === undefined) {
      return [];
    }

    return [
      {
        path: `/${pathOfType(company.type)}/${company.slug}/${branch.slug}`,
        pattern: `/${pathOfType(company.type)}/:empresa/:sucursal`,
        shows: 'record',
      },
    ];
  });

  const manual = MANUAL.map<PlannedRoute>((one) => ({
    path: `/manual/${one.role}`,
    pattern: '/manual/:rol',
    shows: 'record',
  }));

  return [...STATIC_PUBLIC.map(plain), ...manual, ...companies, ...branches];
}

function railOf(profile: Profile): readonly PlannedRoute[] {
  const panel = panelOf(profile.role);

  return panel ? destinationsFor(panel, profile.businessType).map((one) => plain(one.path)) : [];
}

function buyerRoutes(): readonly PlannedRoute[] {
  return [
    plain('/carrito/entrega'),
    ...open({
      pattern: '/mis-pedidos/:codigo',
      all: ORDERS,
      pathOf: (one) => `/mis-pedidos/${one.slug}`,
      mine: () => true,
    }),
  ];
}

function riderRoutes(riderId: string): readonly PlannedRoute[] {
  const carries = (slug: string): boolean => {
    const order = ORDERS.find((one) => one.slug === slug);

    return order?.assignments.some((one) => one.riderId === riderId) ?? false;
  };

  return [
    ...open({
      pattern: '/rider/encargos/:codigo',
      all: ORDERS,
      pathOf: (one) => `/rider/encargos/${one.slug}`,
      mine: (one) => carries(one.slug),
    }),
    ...open({
      pattern: '/rider/encargos/:codigo/escanear',
      all: ORDERS,
      pathOf: (one) => `/rider/encargos/${one.slug}/escanear`,
      mine: (one) => carries(one.slug),
    }),
    ...open({
      pattern: '/rider/acuerdos/:id',
      all: AGREEMENTS,
      pathOf: (one) => `/rider/acuerdos/${one.id}`,
      mine: (one) => one.riderId === riderId,
    }),
    ...open({
      pattern: '/rider/cargas/:id',
      all: TRUCK_LOADS,
      pathOf: (one) => `/rider/cargas/${one.id}`,
      mine: (one) => one.riderId === riderId,
    }),
  ];
}

function companyRoutes(companyId: string): readonly PlannedRoute[] {
  return [
    ...open({
      pattern: '/empresa/sucursales/:id',
      all: BRANCHES,
      pathOf: (one) => `/empresa/sucursales/${one.id}`,
      mine: (one) => one.companyId === companyId,
    }),
    ...open({
      pattern: '/empresa/riders/:slug',
      all: RIDERS,
      pathOf: (one) => `/empresa/riders/${one.slug}`,
      mine: () => true,
    }),
    ...open({
      pattern: '/empresa/catalogo/:id',
      all: PRODUCTS,
      pathOf: (one) => `/empresa/catalogo/${one.id}`,
      mine: (one) => one.companyId === companyId,
    }),
  ];
}

function branchRoutes(profile: Profile): readonly PlannedRoute[] {
  const stock = profile.businessType === 'restaurante' ? 'carta' : 'catalogo';

  return [
    ...open({
      pattern: '/sucursal/pedidos/:codigo',
      all: ORDERS,
      pathOf: (one) => `/sucursal/pedidos/${one.slug}`,
      mine: (one) =>
        one.originBranchId === profile.branchId || one.destinationBranchId === profile.branchId,
    }),
    ...open({
      pattern: `/sucursal/${stock}/:id`,
      all: PRODUCTS,
      pathOf: (one) => `/sucursal/${stock}/${one.id}`,
      mine: (one) => one.companyId === profile.companyId,
    }),
  ];
}

function detailsOf(profile: Profile): readonly PlannedRoute[] {
  if (profile.role === 'comprador') {
    return buyerRoutes();
  }

  if (profile.role === 'rider') {
    return riderRoutes(profile.riderId ?? '');
  }

  if (profile.role === 'gerente-empresa') {
    return companyRoutes(profile.companyId ?? '');
  }

  if (profile.role === 'gerente-sucursal') {
    return branchRoutes(profile);
  }

  return [];
}

function stocked(): Fill | undefined {
  const branch = BRANCHES.find(
    (one) => one.open && PRODUCTS.some((product) => product.companyId === one.companyId),
  );
  const company = branch ? companyOf(branch.companyId) : undefined;

  if (branch === undefined || company === undefined) {
    return undefined;
  }

  return {
    path: `/${pathOfType(company.type)}/${company.slug}/${branch.slug}`,
    button: ADD_TO_CART,
  };
}

function cartWalks(): readonly PlannedProfile[] {
  const fill = stocked();

  if (fill === undefined) {
    return [];
  }

  const buyer = PROFILES.find((one) => one.role === 'comprador');

  return [
    {
      id: 'anon-carrito',
      button: undefined,
      fill,
      routes: [plain('/'), plain('/restaurantes'), plain(fill.path)],
    },
    ...(buyer === undefined
      ? []
      : [
          {
            id: `${buyer.id}-carrito`,
            button: `${buyer.label} · ${buyer.name}`,
            fill,
            routes: [plain(buyer.home), plain('/carrito')],
          },
        ]),
  ];
}

export function sweepPlan(): readonly PlannedProfile[] {
  return [
    { id: 'anon', button: undefined, routes: publicRoutes() },
    ...PROFILES.map<PlannedProfile>((profile) => ({
      id: profile.id,
      button: `${profile.label} · ${profile.name}`,
      routes: [...railOf(profile), ...detailsOf(profile)],
    })),
    ...cartWalks(),
  ];
}
