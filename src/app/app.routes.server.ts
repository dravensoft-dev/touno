import { RenderMode, ServerRoute } from '@angular/ssr';
import { MANUAL } from './domain/manual.data';
import { AGREEMENTS } from './domain/agreements.data';
import { BRANCHES, COMPANIES } from './domain/businesses.data';
import { BusinessType } from './domain/businesses.model';
import { PRODUCTS } from './domain/catalog.data';
import { TRUCK_LOADS } from './domain/loads.data';
import { ORDERS } from './domain/orders.data';
import { RIDERS } from './domain/riders.data';

function companiesOfType(type: BusinessType) {
  return COMPANIES.filter((one) => one.type === type);
}

function companyParams(type: BusinessType): Promise<Record<string, string>[]> {
  return Promise.resolve(companiesOfType(type).map((one) => ({ empresa: one.slug })));
}

function branchParams(type: BusinessType): Promise<Record<string, string>[]> {
  const slugs = new Map(companiesOfType(type).map((one) => [one.id, one.slug]));

  return Promise.resolve(
    BRANCHES.filter((one) => slugs.has(one.companyId)).map((one) => ({
      empresa: slugs.get(one.companyId) ?? '',
      sucursal: one.slug,
    })),
  );
}

function orderParams(): Promise<Record<string, string>[]> {
  return Promise.resolve(ORDERS.map((one) => ({ codigo: one.slug })));
}

function productParams(type: BusinessType): Promise<Record<string, string>[]> {
  const ids = new Set(companiesOfType(type).map((one) => one.id));

  return Promise.resolve(
    PRODUCTS.filter((one) => ids.has(one.companyId)).map((one) => ({ id: one.id })),
  );
}

export const serverRoutes: ServerRoute[] = [
  {
    path: 'restaurantes/:empresa',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: () => companyParams('restaurante'),
  },
  {
    path: 'restaurantes/:empresa/:sucursal',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: () => branchParams('restaurante'),
  },
  {
    path: 'tiendas/:empresa',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: () => companyParams('importadora'),
  },
  {
    path: 'tiendas/:empresa/:sucursal',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: () => branchParams('importadora'),
  },
  {
    path: 'mis-pedidos/:codigo',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: orderParams,
  },
  {
    path: 'rider/encargos/:codigo/escanear',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: orderParams,
  },
  {
    path: 'rider/encargos/:codigo',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: orderParams,
  },
  {
    path: 'rider/cargas/:id',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: () => Promise.resolve(TRUCK_LOADS.map((one) => ({ id: one.id }))),
  },
  {
    path: 'rider/acuerdos/:id',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: () => Promise.resolve(AGREEMENTS.map((one) => ({ id: one.id }))),
  },
  {
    path: 'empresa/sucursales/:id',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: () => Promise.resolve(BRANCHES.map((one) => ({ id: one.id }))),
  },
  {
    path: 'empresa/catalogo/:id',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: () => Promise.resolve(PRODUCTS.map((one) => ({ id: one.id }))),
  },
  {
    path: 'empresa/riders/:slug',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: () => Promise.resolve(RIDERS.map((one) => ({ slug: one.slug }))),
  },
  {
    path: 'sucursal/pedidos/:codigo',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: orderParams,
  },
  {
    path: 'sucursal/carta/:id',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: () => productParams('restaurante'),
  },
  {
    path: 'sucursal/catalogo/:id',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: () => productParams('importadora'),
  },
  {
    path: 'manual/:rol',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: () => Promise.resolve(MANUAL.map((one) => ({ rol: one.role }))),
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
