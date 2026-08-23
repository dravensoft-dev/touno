import { BusinessType } from '../domain/businesses.model';
import { Role } from '../domain/session';

export interface Destination {
  readonly id: string;
  readonly label: string;
  readonly icon: string;
  readonly path: string;
  readonly type?: BusinessType;
}

export const BAR_SLOTS = 3;

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
      },
      {
        id: 'pedidos',
        label: 'Pedidos',
        icon: 'ph-bold ph-tray',
        path: '/empresa/pedidos',
      },
      {
        id: 'catalogo',
        label: 'Catálogo',
        icon: 'ph-bold ph-tag',
        path: '/empresa/catalogo',
      },
      {
        id: 'riders',
        label: 'Riders',
        icon: 'ph-bold ph-motorcycle',
        path: '/empresa/riders',
      },
      {
        id: 'finanzas',
        label: 'Finanzas',
        icon: 'ph-bold ph-wallet',
        path: '/empresa/finanzas',
      },
      {
        id: 'ajustes',
        label: 'Ajustes',
        icon: 'ph-bold ph-gear',
        path: '/empresa/ajustes',
      },
      {
        id: 'manual',
        label: 'Manual',
        icon: 'ph-bold ph-book-open-text',
        path: '/manual/gerente-empresa',
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
      },
      {
        id: 'carta',
        label: 'Carta',
        icon: 'ph-bold ph-list-bullets',
        path: '/sucursal/carta',
        type: 'restaurante',
      },
      {
        id: 'catalogo',
        label: 'Catálogo',
        icon: 'ph-bold ph-tag',
        path: '/sucursal/catalogo',
        type: 'importadora',
      },
      {
        id: 'entregas',
        label: 'Entregas',
        icon: 'ph-bold ph-hand-arrow-down',
        path: '/sucursal/entregas',
      },
      {
        id: 'riders',
        label: 'Riders',
        icon: 'ph-bold ph-motorcycle',
        path: '/sucursal/riders',
      },
      {
        id: 'historial',
        label: 'Historial',
        icon: 'ph-bold ph-clock-counter-clockwise',
        path: '/sucursal/historial',
      },
      {
        id: 'ajustes',
        label: 'Ajustes',
        icon: 'ph-bold ph-gear',
        path: '/sucursal/ajustes',
      },
      {
        id: 'manual',
        label: 'Manual',
        icon: 'ph-bold ph-book-open-text',
        path: '/manual/gerente-sucursal',
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
      },
      {
        id: 'encargos',
        label: 'Encargos',
        icon: 'ph-bold ph-navigation-arrow',
        path: '/rider/encargos',
      },
      {
        id: 'acuerdos',
        label: 'Acuerdos',
        icon: 'ph-bold ph-handshake',
        path: '/rider/acuerdos',
      },
      {
        id: 'ganancias',
        label: 'Ganancias',
        icon: 'ph-bold ph-hand-coins',
        path: '/rider/ganancias',
      },
      {
        id: 'manual',
        label: 'Manual',
        icon: 'ph-bold ph-book-open-text',
        path: '/manual/rider',
      },
    ],
  },
  {
    role: 'comprador',
    prefix: '/mis-pedidos',
    label: 'Panel del comprador',
    destinations: [
      {
        id: 'tienda',
        label: 'Tienda',
        icon: 'ph-bold ph-storefront',
        path: '/feed',
      },
      {
        id: 'carrito',
        label: 'Carrito',
        icon: 'ph-bold ph-shopping-cart-simple',
        path: '/carrito',
      },
      {
        id: 'mis-pedidos',
        label: 'Mis pedidos',
        icon: 'ph-bold ph-package',
        path: '/mis-pedidos',
      },
      {
        id: 'manual',
        label: 'Manual',
        icon: 'ph-bold ph-book-open-text',
        path: '/manual/comprador',
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
      },
      {
        id: 'clima',
        label: 'Clima',
        icon: 'ph-bold ph-cloud-rain',
        path: '/plataforma/clima',
      },
      {
        id: 'red',
        label: 'Red',
        icon: 'ph-bold ph-graph',
        path: '/plataforma/red',
      },
      {
        id: 'manual',
        label: 'Manual',
        icon: 'ph-bold ph-book-open-text',
        path: '/manual/operador',
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

export function panelOf(role: Role): PanelArea | undefined {
  return PANELS.find((panel) => panel.role === role);
}

export function barDestinations<T extends Destination>(destinations: readonly T[]): readonly T[] {
  return destinations.slice(0, BAR_SLOTS);
}

export function moreDestinations<T extends Destination>(destinations: readonly T[]): readonly T[] {
  return destinations.slice(BAR_SLOTS);
}

export function activeIdIn(panel: PanelArea, url: string): string | undefined {
  const path = url.split('?')[0];

  return [...panel.destinations]
    .sort((left, right) => right.path.length - left.path.length)
    .find((destination) => under(path, destination.path))?.id;
}
