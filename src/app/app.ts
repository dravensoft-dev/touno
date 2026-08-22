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
  ArenaIconButton,
  ArenaMain,
  ArenaMenu,
  ArenaNav,
  ArenaSideNav,
  ArenaSideNavItem,
  ArenaSkipLink,
  ArenaToast,
  ArenaToastHost,
  ArenaToastQueue,
  ArenaUnauthCard,
} from '@dravensoft/arena-angular';
import type { ArenaMenuItem } from '@dravensoft/arena-angular';
import { Cart } from './domain/cart';
import { Profile, Role, Session } from './domain/session';
import { Destination, activeIdIn, destinationsFor, panelFor } from './layout/panel-nav';
import { scrollAway } from './layout/scroll-away';
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
  readonly icon: string;
  readonly exact: boolean;
}

const GATE_NOUN: Record<Role, string> = {
  comprador: 'comprador',
  rider: 'rider',
  'gerente-empresa': 'gerente de empresa',
  'gerente-sucursal': 'gerente de sucursal',
  operador: 'operador de Touno',
};

const PUBLIC_LINKS: readonly PublicLink[] = [
  { path: '/restaurantes', label: 'Restaurantes', icon: 'ph-bold ph-fork-knife', exact: false },
  { path: '/tiendas', label: 'Importadoras', icon: 'ph-bold ph-package', exact: false },
  { path: '/riders', label: 'Maneja con Touno', icon: 'ph-bold ph-motorcycle', exact: true },
];

const MENU_LINKS: readonly ArenaMenuItem[] = PUBLIC_LINKS.map((link) => ({
  label: link.label,
  icon: link.icon,
}));

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'arena-shell arena-stack arena-stack--section',
    '[class.shell-bar-away]': 'barAway()',
  },
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
    ArenaIconButton,
    ArenaMenu,
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

  protected readonly menuLinks = MENU_LINKS;

  protected readonly barAway = scrollAway();

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

  protected readonly destinations = computed<readonly Reachable[]>(() => {
    const panel = this.panel();

    if (!panel) {
      return [];
    }

    return destinationsFor(panel, this.session.businessType()).map((destination) => ({
      ...destination,
      href: this.location.prepareExternalUrl(destination.path),
    }));
  });

  protected readonly barDestinations = computed(() =>
    this.destinations().filter((destination) => destination.bar),
  );

  protected readonly unlocked = computed(() => {
    const panel = this.panel();

    return panel === undefined || this.session.is(panel.role);
  });

  protected readonly gateProfiles = computed<readonly Profile[]>(() => {
    const panel = this.panel();

    return panel ? this.session.profiles.filter((one) => one.role === panel.role) : [];
  });

  protected readonly gateTitle = computed(() => {
    const panel = this.panel();

    return panel ? `Ingresa como ${GATE_NOUN[panel.role]}` : 'Ingresa a Touno';
  });

  protected go(id: string): void {
    const destination = this.destinations().find((one) => one.id === id);

    if (destination) {
      void this.router.navigateByUrl(destination.path);
    }
  }

  protected enter(profileId: string): void {
    this.session.enter(profileId);
  }

  protected leave(): void {
    this.session.leave();
    void this.router.navigateByUrl('/');
  }

  protected toLink(item: ArenaMenuItem): void {
    const link = PUBLIC_LINKS.find((one) => one.label === item.label);

    if (link) {
      void this.router.navigateByUrl(link.path);
    }
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
