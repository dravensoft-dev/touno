import { BusinessType } from '../domain/businesses.model';
import { Role } from '../domain/session';

export interface Destination {
  readonly id: string;
  readonly label: string;
  readonly icon: string;
  readonly path: string;
  readonly bar: boolean;
  readonly type?: BusinessType;
}

export interface PanelArea {
  readonly role: Role;
  readonly prefix: string;
  readonly label: string;
  readonly destinations: readonly Destination[];
}

export const PANELS: readonly PanelArea[] = [
  {
    role: 'gerente-empresa',
    prefix: '/empresa',
    label: 'Panel de la empresa',
    destinations: [
      {
        id: 'sucursales',
        label: 'Sucursales',
        icon: 'ph-bold ph-buildings',
        path: '/empresa/sucursales',
        bar: true,
      },
      {
        id: 'pedidos',
        label: 'Pedidos',
        icon: 'ph-bold ph-tray',
        path: '/empresa/pedidos',
        bar: true,
      },
      {
        id: 'catalogo',
        label: 'Catálogo',
        icon: 'ph-bold ph-tag',
        path: '/empresa/catalogo',
        bar: true,
      },
      {
        id: 'riders',
        label: 'Riders',
        icon: 'ph-bold ph-motorcycle',
        path: '/empresa/riders',
        bar: true,
      },
      {
        id: 'finanzas',
        label: 'Finanzas',
        icon: 'ph-bold ph-wallet',
        path: '/empresa/finanzas',
        bar: false,
      },
      {
        id: 'ajustes',
        label: 'Ajustes',
        icon: 'ph-bold ph-gear',
        path: '/empresa/ajustes',
        bar: false,
      },
      {
        id: 'manual',
        label: 'Manual',
        icon: 'ph-bold ph-book-open-text',
        path: '/manual/gerente-empresa',
        bar: false,
      },
    ],
  },
  {
    role: 'gerente-sucursal',
    prefix: '/sucursal',
    label: 'Panel de la sucursal',
    destinations: [
      {
        id: 'pedidos',
        label: 'Pedidos',
        icon: 'ph-bold ph-tray',
        path: '/sucursal/pedidos',
        bar: true,
      },
      {
        id: 'carta',
        label: 'Carta',
        icon: 'ph-bold ph-list-bullets',
        path: '/sucursal/carta',
        bar: true,
        type: 'restaurante',
      },
      {
        id: 'catalogo',
        label: 'Catálogo',
        icon: 'ph-bold ph-tag',
        path: '/sucursal/catalogo',
        bar: true,
        type: 'importadora',
      },
      {
        id: 'entregas',
        label: 'Entregas',
        icon: 'ph-bold ph-hand-arrow-down',
        path: '/sucursal/entregas',
        bar: true,
      },
      {
        id: 'riders',
        label: 'Riders',
        icon: 'ph-bold ph-motorcycle',
        path: '/sucursal/riders',
        bar: false,
      },
      {
        id: 'historial',
        label: 'Historial',
        icon: 'ph-bold ph-clock-counter-clockwise',
        path: '/sucursal/historial',
        bar: false,
      },
      {
        id: 'ajustes',
        label: 'Ajustes',
        icon: 'ph-bold ph-gear',
        path: '/sucursal/ajustes',
        bar: false,
      },
      {
        id: 'manual',
        label: 'Manual',
        icon: 'ph-bold ph-book-open-text',
        path: '/manual/gerente-sucursal',
        bar: false,
      },
    ],
  },
  {
    role: 'rider',
    prefix: '/rider',
    label: 'Panel del rider',
    destinations: [
      {
        id: 'turno',
        label: 'Turno',
        icon: 'ph-bold ph-power',
        path: '/rider/turno',
        bar: true,
      },
      {
        id: 'encargos',
        label: 'Encargos',
        icon: 'ph-bold ph-navigation-arrow',
        path: '/rider/encargos',
        bar: true,
      },
      {
        id: 'acuerdos',
        label: 'Acuerdos',
        icon: 'ph-bold ph-handshake',
        path: '/rider/acuerdos',
        bar: true,
      },
      {
        id: 'ganancias',
        label: 'Ganancias',
        icon: 'ph-bold ph-hand-coins',
        path: '/rider/ganancias',
        bar: true,
      },
      {
        id: 'manual',
        label: 'Manual',
        icon: 'ph-bold ph-book-open-text',
        path: '/manual/rider',
        bar: false,
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
      {
        id: 'manual',
        label: 'Manual',
        icon: 'ph-bold ph-book-open-text',
        path: '/manual/comprador',
        bar: false,
      },
    ],
  },
  {
    role: 'operador',
    prefix: '/plataforma',
    label: 'Panel de Touno',
    destinations: [
      {
        id: 'tarifas',
        label: 'Tarifas',
        icon: 'ph-bold ph-percent',
        path: '/plataforma/tarifas',
        bar: true,
      },
      {
        id: 'clima',
        label: 'Clima',
        icon: 'ph-bold ph-cloud-rain',
        path: '/plataforma/clima',
        bar: true,
      },
      {
        id: 'red',
        label: 'Red',
        icon: 'ph-bold ph-graph',
        path: '/plataforma/red',
        bar: true,
      },
      {
        id: 'manual',
        label: 'Manual',
        icon: 'ph-bold ph-book-open-text',
        path: '/manual/operador',
        bar: false,
      },
    ],
  },
];

export const BUYER_PREFIXES: readonly string[] = ['/feed', '/carrito', '/mis-pedidos'];

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

export function destinationsFor(
  panel: PanelArea,
  type: BusinessType | undefined,
): readonly Destination[] {
  return panel.destinations.filter((one) => one.type === undefined || one.type === type);
}

export function activeIdIn(panel: PanelArea, url: string): string | undefined {
  const path = url.split('?')[0];

  return [...panel.destinations]
    .sort((left, right) => right.path.length - left.path.length)
    .find((destination) => under(path, destination.path))?.id;
}
