import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import {
  ArenaActions,
  ArenaAppBar,
  ArenaAppLogo,
  ArenaAvatar,
  ArenaBottomNav,
  ArenaBottomNavItem,
  ArenaBrand,
  ArenaButton,
  ArenaFooter,
  ArenaIconButton,
  ArenaMain,
  ArenaSheet,
  ArenaSideNav,
  ArenaSideNavItem,
  ArenaSkipLink,
  ArenaToast,
  ArenaToastHost,
  ArenaToastQueue,
  ArenaUnauthCard,
} from '@dravensoft/arena-angular';
import { Cart } from './domain/cart';
import { Profile, Role, Session } from './domain/session';
import {
  Destination,
  activeIdIn,
  barDestinations,
  destinationsFor,
  moreDestinations,
  panelFor,
  panelOf,
} from './layout/panel-nav';
import { scrollAway } from './layout/scroll-away';
import { SiteFooter } from './layout/site-footer/site-footer';
import { ThemeToggle } from './layout/theme-toggle/theme-toggle';
import { BrandMark } from './shared/brand-mark/brand-mark';
import { SITE_NAME } from './seo/site';

interface Reachable extends Destination {
  readonly href: string;
}

const GATE_NOUN: Record<Role, string> = {
  comprador: 'comprador',
  rider: 'rider',
  'gerente-empresa': 'gerente de empresa',
  'gerente-sucursal': 'gerente de sucursal',
  operador: 'operador de Touno',
};

const MORE_ID = 'mas';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'arena-shell arena-stack arena-stack--section',
    '[class.shell-bar-away]': 'barAway()',
    '[class.shell-signed-in]': 'signedIn()',
  },
  imports: [
    RouterOutlet,
    RouterLink,
    ArenaSkipLink,
    ArenaMain,
    ArenaAppBar,
    ArenaAppLogo,
    ArenaAvatar,
    ArenaBrand,
    ArenaActions,
    ArenaButton,
    ArenaFooter,
    ArenaIconButton,
    ArenaSheet,
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

  protected readonly moreId = MORE_ID;

  protected readonly moreOpen = signal(false);

  protected readonly signedIn = computed(() => this.session.profile() !== undefined);

  protected readonly barAway = scrollAway();

  protected readonly url = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.router.url),
    ),
    { initialValue: this.router.url },
  );

  protected readonly panel = computed(() => {
    const role = this.session.role();

    return panelFor(this.url()) ?? (role ? panelOf(role) : undefined);
  });

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

  protected readonly bar = computed(() => barDestinations(this.destinations()));

  protected readonly more = computed(() => moreDestinations(this.destinations()));

  protected readonly barActiveId = computed(() => {
    const active = this.activeId();

    return this.more().some((destination) => destination.id === active) ? MORE_ID : active;
  });

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
    if (id === MORE_ID) {
      this.moreOpen.set(true);

      return;
    }

    const destination = this.destinations().find((one) => one.id === id);

    if (destination) {
      this.closeMore();
      void this.router.navigateByUrl(destination.path);
    }
  }

  protected closeMore(): void {
    this.moreOpen.set(false);
  }

  protected enter(profileId: string): void {
    this.session.enter(profileId);
  }

  protected leave(): void {
    this.closeMore();
    this.session.leave();
    void this.router.navigateByUrl('/');
  }

  protected toCart(): void {
    this.closeMore();
    void this.router.navigateByUrl('/carrito');
  }

  protected toSignIn(): void {
    void this.router.navigateByUrl('/ingresar');
  }

  protected dismiss(id: number): void {
    this.toasts.dismiss(id);
  }
}
