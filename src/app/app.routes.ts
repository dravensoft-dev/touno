import { Routes } from '@angular/router';
import { arenaRouteMeta } from '@dravensoft/arena-angular/metadata';
import { SITE_DESCRIPTION, SITE_NAME } from './seo/site';

const PRIVATE = arenaRouteMeta({ robots: 'noindex,follow' });

export const routes: Routes = [
  {
    path: '',
    title: `${SITE_NAME} · Comida y encomiendas en Bolivia`,
    loadComponent: () => import('./pages/public/home/home').then((m) => m.Home),
    data: arenaRouteMeta({ description: SITE_DESCRIPTION, type: 'website' }),
  },
  {
    path: 'restaurantes',
    title: 'Restaurantes',
    loadComponent: () => import('./pages/public/merchants/merchants').then((m) => m.Merchants),
    data: {
      kind: 'restaurante',
      ...arenaRouteMeta({
        description:
          'Restaurantes que reciben pedidos ahora en La Paz, Santa Cruz, Cochabamba, Oruro y Sucre.',
      }),
    },
  },
  {
    path: 'restaurantes/:slug',
    loadComponent: () =>
      import('./pages/public/merchant-detail/merchant-detail').then((m) => m.MerchantDetail),
    data: { kind: 'restaurante' },
  },
  {
    path: 'tiendas',
    title: 'Importadoras',
    loadComponent: () => import('./pages/public/merchants/merchants').then((m) => m.Merchants),
    data: {
      kind: 'importadora',
      ...arenaRouteMeta({
        description:
          'Importadoras que despachan el mismo día, con guía, código de retiro y seguimiento por hitos.',
      }),
    },
  },
  {
    path: 'tiendas/:slug',
    loadComponent: () =>
      import('./pages/public/merchant-detail/merchant-detail').then((m) => m.MerchantDetail),
    data: { kind: 'importadora' },
  },
  {
    path: 'seguimiento/:guia',
    loadComponent: () => import('./pages/public/tracking/tracking').then((m) => m.Tracking),
  },
  {
    path: 'tarifas',
    title: 'Tarifas por ruta',
    loadComponent: () => import('./pages/public/tariffs/tariffs').then((m) => m.Tariffs),
    data: arenaRouteMeta({
      description:
        'Cuánto cuesta enviar una encomienda entre ciudades de Bolivia, con el recojo incluido.',
    }),
  },
  {
    path: 'conducir',
    title: 'Conducir con Touno',
    loadComponent: () => import('./pages/public/drive/drive').then((m) => m.Drive),
    data: arenaRouteMeta({
      description:
        'Cómo se contrata a un conductor en Touno: por carreras, con tarifa fija y aceptación del conductor.',
    }),
  },
  {
    path: 'ingresar',
    title: 'Ingresar',
    loadComponent: () => import('./pages/public/sign-in/sign-in').then((m) => m.SignIn),
    data: PRIVATE,
  },
  {
    path: 'restaurante/pedidos',
    title: 'Pedidos en vivo',
    loadComponent: () =>
      import('./pages/restaurant/live-orders/live-orders').then((m) => m.RestaurantLiveOrders),
    data: PRIVATE,
  },
  {
    path: 'restaurante/historial',
    title: 'Historial',
    loadComponent: () =>
      import('./pages/restaurant/history/history').then((m) => m.RestaurantHistory),
    data: PRIVATE,
  },
  {
    path: 'restaurante/carta',
    title: 'Carta',
    loadComponent: () => import('./pages/restaurant/menu/menu').then((m) => m.RestaurantMenu),
    data: PRIVATE,
  },
  {
    path: 'restaurante/carta/:id',
    title: 'Producto',
    loadComponent: () =>
      import('./pages/restaurant/menu-item/menu-item').then((m) => m.RestaurantMenuItem),
    data: PRIVATE,
  },
  {
    path: 'restaurante/metricas',
    title: 'Métricas',
    loadComponent: () =>
      import('./pages/restaurant/metrics/metrics').then((m) => m.RestaurantMetrics),
    data: PRIVATE,
  },
  {
    path: 'restaurante/finanzas',
    title: 'Finanzas',
    loadComponent: () =>
      import('./pages/restaurant/finance/finance').then((m) => m.RestaurantFinance),
    data: PRIVATE,
  },
  {
    path: 'restaurante/promociones',
    title: 'Promociones',
    loadComponent: () =>
      import('./pages/restaurant/promotions/promotions').then((m) => m.RestaurantPromotions),
    data: PRIVATE,
  },
  {
    path: 'restaurante/resenas',
    title: 'Reseñas',
    loadComponent: () =>
      import('./pages/restaurant/reviews/reviews').then((m) => m.RestaurantReviews),
    data: PRIVATE,
  },
  {
    path: 'restaurante/ajustes',
    title: 'Ajustes',
    loadComponent: () =>
      import('./pages/restaurant/settings/settings').then((m) => m.RestaurantSettings),
    data: PRIVATE,
  },
  {
    path: 'restaurante/conductores',
    title: 'Contratar conductores',
    loadComponent: () =>
      import('./pages/hiring/hire-drivers/hire-drivers').then((m) => m.HireDrivers),
    data: { base: '/restaurante/conductores', businessKind: 'restaurante', ...PRIVATE },
  },
  {
    path: 'restaurante/conductores/:id',
    title: 'Perfil del conductor',
    loadComponent: () =>
      import('./pages/hiring/driver-profile/driver-profile').then((m) => m.DriverProfile),
    data: PRIVATE,
  },
  {
    path: 'importadora/envios',
    title: 'Envíos',
    loadComponent: () =>
      import('./pages/importer/shipments/shipments').then((m) => m.ImporterShipments),
    data: PRIVATE,
  },
  {
    path: 'importadora/envios/nuevo',
    title: 'Alta y recojo',
    loadComponent: () =>
      import('./pages/importer/new-shipment/new-shipment').then((m) => m.ImporterNewShipment),
    data: PRIVATE,
  },
  {
    path: 'importadora/envios/nuevo/pago',
    title: 'Cobro único',
    loadComponent: () => import('./pages/importer/payment/payment').then((m) => m.ImporterPayment),
    data: PRIVATE,
  },
  {
    path: 'importadora/envios/:guia',
    title: 'Detalle del envío',
    loadComponent: () =>
      import('./pages/importer/shipment-detail/shipment-detail').then(
        (m) => m.ImporterShipmentDetail,
      ),
    data: PRIVATE,
  },
  {
    path: 'importadora/lote',
    title: 'Envíos en lote',
    loadComponent: () => import('./pages/importer/batch/batch').then((m) => m.ImporterBatch),
    data: PRIVATE,
  },
  {
    path: 'importadora/cuenta',
    title: 'Cuenta y cobros',
    loadComponent: () => import('./pages/importer/account/account').then((m) => m.ImporterAccount),
    data: PRIVATE,
  },
  {
    path: 'importadora/catalogo',
    title: 'Catálogo publicado',
    loadComponent: () => import('./pages/importer/catalog/catalog').then((m) => m.ImporterCatalog),
    data: PRIVATE,
  },
  {
    path: 'importadora/conductores',
    title: 'Contratar conductores',
    loadComponent: () =>
      import('./pages/hiring/hire-drivers/hire-drivers').then((m) => m.HireDrivers),
    data: { base: '/importadora/conductores', businessKind: 'importadora', ...PRIVATE },
  },
  {
    path: 'importadora/conductores/:id',
    title: 'Perfil del conductor',
    loadComponent: () =>
      import('./pages/hiring/driver-profile/driver-profile').then((m) => m.DriverProfile),
    data: PRIVATE,
  },
  {
    path: 'carrito',
    title: 'Tu carrito',
    loadComponent: () => import('./pages/buyer/cart/cart').then((m) => m.BuyerCart),
    data: PRIVATE,
  },
  {
    path: 'mis-pedidos',
    title: 'Mis pedidos',
    loadComponent: () => import('./pages/buyer/orders/orders').then((m) => m.BuyerOrders),
    data: PRIVATE,
  },
  {
    path: 'mis-pedidos/:codigo',
    title: 'Detalle del pedido',
    loadComponent: () =>
      import('./pages/buyer/order-detail/order-detail').then((m) => m.BuyerOrderDetail),
    data: PRIVATE,
  },
  {
    path: 'conductor/turno',
    title: 'Turno',
    loadComponent: () => import('./pages/driver/shift/shift').then((m) => m.DriverShift),
    data: PRIVATE,
  },
  {
    path: 'conductor/carreras',
    title: 'Carrera entrante',
    loadComponent: () => import('./pages/driver/incoming/incoming').then((m) => m.DriverIncoming),
    data: PRIVATE,
  },
  {
    path: 'conductor/carreras/:id/recojo',
    title: 'Recojo verificado',
    loadComponent: () => import('./pages/driver/pickup/pickup').then((m) => m.DriverPickup),
    data: PRIVATE,
  },
  {
    path: 'conductor/carreras/:id/entrega',
    title: 'Entrega en oficina',
    loadComponent: () => import('./pages/driver/dropoff/dropoff').then((m) => m.DriverDropoff),
    data: PRIVATE,
  },
  {
    path: 'conductor/ganancias',
    title: 'Ganancias',
    loadComponent: () => import('./pages/driver/earnings/earnings').then((m) => m.DriverEarnings),
    data: PRIVATE,
  },
  {
    path: 'conductor/ofertas',
    title: 'Ofertas de contratación',
    loadComponent: () => import('./pages/driver/offers/offers').then((m) => m.DriverOffers),
    data: PRIVATE,
  },
  {
    path: 'conductor/ofertas/:id',
    title: 'Oferta de contratación',
    loadComponent: () =>
      import('./pages/driver/offer-detail/offer-detail').then((m) => m.DriverOfferDetail),
    data: PRIVATE,
  },
  {
    path: '404',
    title: 'Página no encontrada',
    loadComponent: () => import('./pages/public/not-found/not-found').then((m) => m.NotFound),
    data: PRIVATE,
  },
  {
    path: '**',
    title: 'Página no encontrada',
    loadComponent: () => import('./pages/public/not-found/not-found').then((m) => m.NotFound),
    data: PRIVATE,
  },
];
