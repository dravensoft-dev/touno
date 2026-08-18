import { Role } from '../domain/session';

export interface Destination {
  readonly id: string;
  readonly label: string;
  readonly icon: string;
  readonly path: string;
  readonly bar: boolean;
}

export interface PanelArea {
  readonly role: Role;
  readonly prefix: string;
  readonly label: string;
  readonly destinations: readonly Destination[];
}

export const PANELS: readonly PanelArea[] = [
  {
    role: 'importadora',
    prefix: '/importadora',
    label: 'Panel de la importadora',
    destinations: [
      {
        id: 'envios',
        label: 'Envíos',
        icon: 'ph-bold ph-package',
        path: '/importadora/envios',
        bar: true,
      },
      {
        id: 'nuevo',
        label: 'Nuevo',
        icon: 'ph-bold ph-plus-circle',
        path: '/importadora/envios/nuevo',
        bar: true,
      },
      {
        id: 'lote',
        label: 'Lote',
        icon: 'ph-bold ph-stack',
        path: '/importadora/lote',
        bar: true,
      },
      {
        id: 'catalogo',
        label: 'Catálogo',
        icon: 'ph-bold ph-tag',
        path: '/importadora/catalogo',
        bar: false,
      },
      {
        id: 'conductores',
        label: 'Conductores',
        icon: 'ph-bold ph-steering-wheel',
        path: '/importadora/conductores',
        bar: false,
      },
      {
        id: 'cuenta',
        label: 'Cuenta',
        icon: 'ph-bold ph-chart-bar',
        path: '/importadora/cuenta',
        bar: true,
      },
    ],
  },
  {
    role: 'restaurante',
    prefix: '/restaurante',
    label: 'Panel del restaurante',
    destinations: [
      {
        id: 'pedidos',
        label: 'Pedidos',
        icon: 'ph-bold ph-tray',
        path: '/restaurante/pedidos',
        bar: true,
      },
      {
        id: 'carta',
        label: 'Carta',
        icon: 'ph-bold ph-list-bullets',
        path: '/restaurante/carta',
        bar: true,
      },
      {
        id: 'historial',
        label: 'Historial',
        icon: 'ph-bold ph-clock-counter-clockwise',
        path: '/restaurante/historial',
        bar: false,
      },
      {
        id: 'metricas',
        label: 'Métricas',
        icon: 'ph-bold ph-chart-line',
        path: '/restaurante/metricas',
        bar: true,
      },
      {
        id: 'finanzas',
        label: 'Finanzas',
        icon: 'ph-bold ph-wallet',
        path: '/restaurante/finanzas',
        bar: false,
      },
      {
        id: 'promociones',
        label: 'Promociones',
        icon: 'ph-bold ph-megaphone',
        path: '/restaurante/promociones',
        bar: false,
      },
      {
        id: 'resenas',
        label: 'Reseñas',
        icon: 'ph-bold ph-star',
        path: '/restaurante/resenas',
        bar: false,
      },
      {
        id: 'conductores',
        label: 'Conductores',
        icon: 'ph-bold ph-steering-wheel',
        path: '/restaurante/conductores',
        bar: true,
      },
      {
        id: 'ajustes',
        label: 'Ajustes',
        icon: 'ph-bold ph-gear',
        path: '/restaurante/ajustes',
        bar: false,
      },
    ],
  },
  {
    role: 'conductor',
    prefix: '/conductor',
    label: 'Panel del conductor',
    destinations: [
      {
        id: 'turno',
        label: 'Turno',
        icon: 'ph-bold ph-steering-wheel',
        path: '/conductor/turno',
        bar: true,
      },
      {
        id: 'carreras',
        label: 'Carreras',
        icon: 'ph-bold ph-navigation-arrow',
        path: '/conductor/carreras',
        bar: true,
      },
      {
        id: 'ofertas',
        label: 'Ofertas',
        icon: 'ph-bold ph-handshake',
        path: '/conductor/ofertas',
        bar: true,
      },
      {
        id: 'ganancias',
        label: 'Ganancias',
        icon: 'ph-bold ph-hand-coins',
        path: '/conductor/ganancias',
        bar: true,
      },
    ],
  },
  {
    role: 'comprador',
    prefix: '/mis-pedidos',
    label: 'Panel del comprador',
    destinations: [
      {
        id: 'feed',
        label: 'Feed',
        icon: 'ph-bold ph-squares-four',
        path: '/feed',
        bar: true,
      },
      {
        id: 'tienda',
        label: 'Tienda',
        icon: 'ph-bold ph-storefront',
        path: '/',
        bar: true,
      },
      {
        id: 'carrito',
        label: 'Carrito',
        icon: 'ph-bold ph-shopping-cart-simple',
        path: '/carrito',
        bar: true,
      },
      {
        id: 'mis-pedidos',
        label: 'Mis pedidos',
        icon: 'ph-bold ph-package',
        path: '/mis-pedidos',
        bar: true,
      },
    ],
  },
];

export const BUYER_PREFIXES: readonly string[] = ['/feed', '/mis-pedidos', '/carrito'];

function under(path: string, prefix: string): boolean {
  return path === prefix || path.startsWith(`${prefix}/`);
}

export function panelFor(url: string): PanelArea | undefined {
  const path = url.split('?')[0];

  if (BUYER_PREFIXES.some((prefix) => under(path, prefix))) {
    return PANELS.find((panel) => panel.role === 'comprador');
  }

  return PANELS.find((panel) => under(path, panel.prefix));
}

export function activeIdIn(panel: PanelArea, url: string): string | undefined {
  const path = url.split('?')[0];

  return [...panel.destinations]
    .sort((left, right) => right.path.length - left.path.length)
    .find((destination) => under(path, destination.path))?.id;
}
