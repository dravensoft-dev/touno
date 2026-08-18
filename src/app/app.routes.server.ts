import { RenderMode, ServerRoute } from '@angular/ssr';
import { DRIVERS, HIRING_OFFERS, RIDES } from './domain/drivers.data';
import { MERCHANTS } from './domain/marketplace.data';
import { ORDERS } from './domain/orders.data';
import { PRODUCTS } from './domain/products.data';
import { SHIPMENTS } from './domain/shipping.data';

function slugsOfKind(kind: string): Promise<Record<string, string>[]> {
  return Promise.resolve(
    MERCHANTS.filter((merchant) => merchant.kind === kind).map((merchant) => ({
      slug: merchant.slug,
    })),
  );
}

export const serverRoutes: ServerRoute[] = [
  {
    path: 'restaurantes/:slug',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: () => slugsOfKind('restaurante'),
  },
  {
    path: 'tiendas/:slug',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: () => slugsOfKind('importadora'),
  },
  {
    path: 'seguimiento/:guia',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: () =>
      Promise.resolve(
        SHIPMENTS.filter((shipment) => shipment.publicTracking).map((shipment) => ({
          guia: shipment.slug,
        })),
      ),
  },
  {
    path: 'importadora/envios/:guia',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: () =>
      Promise.resolve(SHIPMENTS.map((shipment) => ({ guia: shipment.slug }))),
  },
  {
    path: 'importadora/conductores/:id',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: () => Promise.resolve(DRIVERS.map((driver) => ({ id: driver.slug }))),
  },
  {
    path: 'restaurante/carta/:id',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: () =>
      Promise.resolve(
        PRODUCTS.filter((product) => product.merchantSlug === 'pollos-copacabana').map(
          (product) => ({ id: product.id }),
        ),
      ),
  },
  {
    path: 'restaurante/conductores/:id',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: () => Promise.resolve(DRIVERS.map((driver) => ({ id: driver.slug }))),
  },
  {
    path: 'mis-pedidos/:codigo',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: () => Promise.resolve(ORDERS.map((order) => ({ codigo: order.slug }))),
  },
  {
    path: 'conductor/carreras/:id/recojo',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: () => Promise.resolve(RIDES.map((ride) => ({ id: ride.id }))),
  },
  {
    path: 'conductor/carreras/:id/entrega',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: () => Promise.resolve(RIDES.map((ride) => ({ id: ride.id }))),
  },
  {
    path: 'conductor/ofertas/:id',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: () => Promise.resolve(HIRING_OFFERS.map((offer) => ({ id: offer.id }))),
  },
  { path: '**', renderMode: RenderMode.Prerender },
];
