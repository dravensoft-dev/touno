import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import {
  ArenaActions,
  ArenaAppBar,
  ArenaAppLogo,
  ArenaBottomNav,
  ArenaBottomNavItem,
  ArenaBrand,
  ArenaButton,
  ArenaMain,
  ArenaNav,
  ArenaSideNav,
  ArenaSideNavItem,
  ArenaSkipLink,
  ArenaToast,
  ArenaToastHost,
  ArenaToastQueue,
  ArenaUnauthCard,
} from '@dravensoft/arena-angular';
import { Cart } from './domain/cart';
import { Role, Session } from './domain/session';
import { Destination, PANELS, activeIdIn, panelFor } from './layout/panel-nav';
import { SiteFooter } from './layout/site-footer/site-footer';
import { ThemeToggle } from './layout/theme-toggle/theme-toggle';
import { BrandMark } from './shared/brand-mark/brand-mark';
import { SITE_NAME } from './seo/site';

interface Reachable extends Destination {
  readonly href: string;
}

interface PublicLink {
  readonly path: string;
  readonly label: string;
  readonly exact: boolean;
}

const GATE_NOUN: Record<Role, string> = {
  comprador: 'comprador',
  restaurante: 'dueño de restaurante',
  importadora: 'dueño de importadora',
  conductor: 'conductor',
};

const PUBLIC_LINKS: readonly PublicLink[] = [
  { path: '/restaurantes', label: 'Restaurantes', exact: false },
  { path: '/tiendas', label: 'Importadoras', exact: false },
  { path: '/tarifas', label: 'Tarifas', exact: true },
  { path: '/conducir', label: 'Conducir', exact: true },
];

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'arena-shell arena-stack arena-stack--section' },
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    ArenaSkipLink,
    ArenaMain,
    ArenaAppBar,
    ArenaAppLogo,
    ArenaBrand,
    ArenaNav,
    ArenaActions,
    ArenaButton,
    ArenaSideNav,
    ArenaSideNavItem,
    ArenaBottomNav,
    ArenaBottomNavItem,
    ArenaUnauthCard,
    ArenaToastHost,
    ArenaToast,
    BrandMark,
    ThemeToggle,
    SiteFooter,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly router = inject(Router);

  private readonly location = inject(Location);

  protected readonly session = inject(Session);

  protected readonly cart = inject(Cart);

  private readonly toasts = inject(ArenaToastQueue);

  protected readonly notices = this.toasts.toasts;

  protected readonly siteName = SITE_NAME;

  protected readonly publicLinks = PUBLIC_LINKS;

  protected readonly profiles = PANELS.map((panel) => panel.role);

  protected readonly url = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.router.url),
    ),
    { initialValue: this.router.url },
  );

  protected readonly panel = computed(() => panelFor(this.url()));

  protected readonly activeId = computed(() => {
    const panel = this.panel();

    return panel ? activeIdIn(panel, this.url()) : undefined;
  });

  protected readonly destinations = computed<readonly Reachable[]>(() =>
    (this.panel()?.destinations ?? []).map((destination) => ({
      ...destination,
      href: this.location.prepareExternalUrl(destination.path),
    })),
  );

  protected readonly barDestinations = computed(() =>
    this.destinations().filter((destination) => destination.bar),
  );

  protected readonly unlocked = computed(() => {
    const panel = this.panel();

    return panel === undefined || this.session.is(panel.role);
  });

  protected readonly gateTitle = computed(() => {
    const panel = this.panel();

    return panel ? `Ingresa como ${GATE_NOUN[panel.role]}` : 'Ingresa a Touno';
  });

  protected go(id: string): void {
    const destination = this.panel()?.destinations.find((one) => one.id === id);

    if (destination) {
      void this.router.navigateByUrl(destination.path);
    }
  }

  protected enter(role: Role): void {
    this.session.enter(role);
  }

  protected leave(): void {
    this.session.leave();
    void this.router.navigateByUrl('/');
  }

  protected toCart(): void {
    void this.router.navigateByUrl('/carrito');
  }

  protected toSignIn(): void {
    void this.router.navigateByUrl('/ingresar');
  }

  protected dismiss(id: number): void {
    this.toasts.dismiss(id);
  }
}
