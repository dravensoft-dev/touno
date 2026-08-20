import { Routes } from '@angular/router';
import { arenaRouteMeta } from '@dravensoft/arena-angular/metadata';
import { SITE_DESCRIPTION } from './seo/site';

const PRIVATE = arenaRouteMeta({ robots: 'noindex,follow' });

export const routes: Routes = [
  {
    path: '',
    title: 'Touno · Comida y encomiendas en Bolivia',
    data: arenaRouteMeta({ description: SITE_DESCRIPTION, type: 'website' }),
    loadComponent: () => import('./pages/public/home/home').then((m) => m.Home),
  },
  {
    path: 'restaurantes',
    title: 'Restaurantes',
    data: {
      type: 'restaurante',
      ...arenaRouteMeta({
        description:
          'Restaurantes de La Paz, Santa Cruz, Cochabamba, Oruro y Sucre, con la sucursal que te queda cerca.',
      }),
    },
    loadComponent: () => import('./pages/public/companies/companies').then((m) => m.Companies),
  },
  {
    path: 'restaurantes/:empresa',
    loadComponent: () => import('./pages/public/company/company').then((m) => m.CompanyDetail),
    data: { type: 'restaurante' },
  },
  {
    path: 'restaurantes/:empresa/:sucursal',
    loadComponent: () => import('./pages/public/branch/branch').then((m) => m.BranchDetail),
    data: { type: 'restaurante' },
  },
  {
    path: 'tiendas',
    title: 'Importadoras',
    data: {
      type: 'importadora',
      ...arenaRouteMeta({
        description:
          'Importadoras con sucursal en tu ciudad: compra desde otra ciudad y recibe en tu puerta o recoge en mostrador.',
      }),
    },
    loadComponent: () => import('./pages/public/companies/companies').then((m) => m.Companies),
  },
  {
    path: 'tiendas/:empresa',
    loadComponent: () => import('./pages/public/company/company').then((m) => m.CompanyDetail),
    data: { type: 'importadora' },
  },
  {
    path: 'tiendas/:empresa/:sucursal',
    loadComponent: () => import('./pages/public/branch/branch').then((m) => m.BranchDetail),
    data: { type: 'importadora' },
  },
  {
    path: 'riders',
    title: 'Maneja con Touno',
    data: arenaRouteMeta({
      description:
        'Trabaja con tu moto, tu auto o tu camión. Eliges para qué sucursales trabajas y el acuerdo lo firman las dos partes.',
    }),
    loadComponent: () =>
      import('./pages/public/ride-with-us/ride-with-us').then((m) => m.RideWithUs),
  },
  {
    path: 'ingresar',
    title: 'Ingresar',
    data: PRIVATE,
    loadComponent: () => import('./pages/public/sign-in/sign-in').then((m) => m.SignIn),
  },

  {
    path: 'feed',
    title: 'Feed',
    data: PRIVATE,
    loadComponent: () => import('./pages/buyer/feed/feed').then((m) => m.Feed),
  },
  {
    path: 'carrito',
    title: 'Tu carrito',
    data: PRIVATE,
    loadComponent: () => import('./pages/buyer/cart/cart').then((m) => m.BuyerCart),
  },
  {
    path: 'carrito/entrega',
    title: 'Cómo quieres recibirlo',
    data: PRIVATE,
    loadComponent: () => import('./pages/buyer/checkout/checkout').then((m) => m.CheckoutPage),
  },
  {
    path: 'mis-pedidos',
    title: 'Mis pedidos',
    data: PRIVATE,
    loadComponent: () => import('./pages/buyer/orders/orders').then((m) => m.BuyerOrders),
  },
  {
    path: 'mis-pedidos/:codigo',
    title: 'Detalle del pedido',
    data: PRIVATE,
    loadComponent: () =>
      import('./pages/buyer/order-detail/order-detail').then((m) => m.BuyerOrderDetail),
  },

  {
    path: 'rider/turno',
    title: 'Turno',
    data: PRIVATE,
    loadComponent: () => import('./pages/rider/shift/shift').then((m) => m.RiderShift),
  },
  {
    path: 'rider/encargos',
    title: 'Encargos',
    data: PRIVATE,
    loadComponent: () => import('./pages/rider/jobs/jobs').then((m) => m.RiderJobs),
  },
  {
    path: 'rider/encargos/:codigo/escanear',
    title: 'Escanear el código',
    data: PRIVATE,
    loadComponent: () => import('./pages/rider/scan/scan').then((m) => m.RiderScan),
  },
  {
    path: 'rider/encargos/:codigo',
    title: 'Encargo',
    data: PRIVATE,
    loadComponent: () =>
      import('./pages/rider/job-detail/job-detail').then((m) => m.RiderJobDetail),
  },
  {
    path: 'rider/cargas/:id',
    title: 'Carga',
    data: PRIVATE,
    loadComponent: () => import('./pages/rider/load/load').then((m) => m.RiderLoad),
  },
  {
    path: 'rider/acuerdos',
    title: 'Acuerdos',
    data: PRIVATE,
    loadComponent: () =>
      import('./pages/rider/agreements/agreements').then((m) => m.RiderAgreements),
  },
  {
    path: 'rider/acuerdos/:id',
    title: 'Acuerdo',
    data: PRIVATE,
    loadComponent: () =>
      import('./pages/rider/agreement-detail/agreement-detail').then((m) => m.RiderAgreementDetail),
  },
  {
    path: 'rider/ganancias',
    title: 'Ganancias',
    data: PRIVATE,
    loadComponent: () => import('./pages/rider/earnings/earnings').then((m) => m.RiderEarnings),
  },

  {
    path: 'empresa/sucursales',
    title: 'Sucursales',
    data: PRIVATE,
    loadComponent: () => import('./pages/company/branches/branches').then((m) => m.CompanyBranches),
  },
  {
    path: 'empresa/sucursales/:id',
    title: 'Sucursal',
    data: PRIVATE,
    loadComponent: () =>
      import('./pages/company/branch-detail/branch-detail').then((m) => m.CompanyBranchDetail),
  },
  {
    path: 'empresa/pedidos',
    title: 'Pedidos de la empresa',
    data: PRIVATE,
    loadComponent: () => import('./pages/company/orders/orders').then((m) => m.CompanyOrders),
  },
  {
    path: 'empresa/catalogo',
    title: 'Catálogo',
    data: PRIVATE,
    loadComponent: () => import('./pages/company/catalog/catalog').then((m) => m.CompanyCatalog),
  },
  {
    path: 'empresa/catalogo/:id',
    title: 'Artículo',
    data: PRIVATE,
    loadComponent: () =>
      import('./pages/company/catalog-item/catalog-item').then((m) => m.CompanyCatalogItem),
  },
  {
    path: 'empresa/riders',
    title: 'Riders de la empresa',
    data: PRIVATE,
    loadComponent: () => import('./pages/company/riders/riders').then((m) => m.CompanyRiders),
  },
  {
    path: 'empresa/riders/:id',
    title: 'Rider',
    data: PRIVATE,
    loadComponent: () =>
      import('./pages/company/rider-detail/rider-detail').then((m) => m.CompanyRiderDetail),
  },
  {
    path: 'empresa/finanzas',
    title: 'Finanzas',
    data: PRIVATE,
    loadComponent: () => import('./pages/company/finance/finance').then((m) => m.CompanyFinance),
  },
  {
    path: 'empresa/ajustes',
    title: 'Ajustes de la empresa',
    data: PRIVATE,
    loadComponent: () => import('./pages/company/settings/settings').then((m) => m.CompanySettings),
  },

  {
    path: 'sucursal/pedidos',
    title: 'Pedidos de la sucursal',
    data: PRIVATE,
    loadComponent: () => import('./pages/branch/orders/orders').then((m) => m.BranchOrders),
  },
  {
    path: 'sucursal/pedidos/:codigo',
    title: 'Pedido',
    data: PRIVATE,
    loadComponent: () =>
      import('./pages/branch/order-detail/order-detail').then((m) => m.BranchOrderDetail),
  },
  {
    path: 'sucursal/entregas',
    title: 'Entregas',
    data: PRIVATE,
    loadComponent: () => import('./pages/branch/pickups/pickups').then((m) => m.BranchPickups),
  },
  {
    path: 'sucursal/riders',
    title: 'Riders de la sucursal',
    data: PRIVATE,
    loadComponent: () => import('./pages/branch/riders/riders').then((m) => m.BranchRiders),
  },
  {
    path: 'sucursal/carta',
    title: 'Carta',
    data: PRIVATE,
    loadComponent: () => import('./pages/branch/stock/stock').then((m) => m.BranchStockPage),
  },
  {
    path: 'sucursal/carta/:id',
    title: 'Plato',
    data: PRIVATE,
    loadComponent: () =>
      import('./pages/branch/stock-item/stock-item').then((m) => m.BranchStockItem),
  },
  {
    path: 'sucursal/catalogo',
    title: 'Catálogo de la sucursal',
    data: PRIVATE,
    loadComponent: () => import('./pages/branch/stock/stock').then((m) => m.BranchStockPage),
  },
  {
    path: 'sucursal/catalogo/:id',
    title: 'Artículo',
    data: PRIVATE,
    loadComponent: () =>
      import('./pages/branch/stock-item/stock-item').then((m) => m.BranchStockItem),
  },
  {
    path: 'sucursal/historial',
    title: 'Historial',
    data: PRIVATE,
    loadComponent: () => import('./pages/branch/history/history').then((m) => m.BranchHistory),
  },
  {
    path: 'sucursal/ajustes',
    title: 'Ajustes de la sucursal',
    data: PRIVATE,
    loadComponent: () => import('./pages/branch/settings/settings').then((m) => m.BranchSettings),
  },

  {
    path: '404',
    title: 'Página no encontrada',
    data: PRIVATE,
    loadComponent: () => import('./pages/public/not-found/not-found').then((m) => m.NotFound),
  },
  {
    path: '**',
    title: 'Página no encontrada',
    data: PRIVATE,
    loadComponent: () => import('./pages/public/not-found/not-found').then((m) => m.NotFound),
  },
];
