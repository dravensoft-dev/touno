import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  afterNextRender,
  inject,
  signal,
} from '@angular/core';
import { ArenaIconButton, ArenaThemeService } from '@dravensoft/arena-angular';

@Component({
  selector: 'app-theme-toggle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [ArenaIconButton],
  template: `
    <span class="theme-toggle__to-dark">
      <arena-icon-button
        icon="ph-bold ph-moon"
        label="Cambiar al tema oscuro"
        variant="ghost"
        (click)="toggle()"
      />
    </span>
    <span class="theme-toggle__to-light">
      <arena-icon-button
        icon="ph-bold ph-sun"
        label="Cambiar al tema claro"
        variant="ghost"
        (click)="toggle()"
      />
    </span>
  `,
  styles: `
    .theme-toggle__to-dark {
      display: contents;
    }

    .theme-toggle__to-light {
      display: none;
    }

    :host-context(.arena-noche) .theme-toggle__to-dark {
      display: none;
    }

    :host-context(.arena-noche) .theme-toggle__to-light {
      display: contents;
    }
  `,
})
export class ThemeToggle {
  private readonly injector = inject(Injector);
  private readonly themes = signal<ArenaThemeService | null>(null);

  constructor() {
    afterNextRender(() => this.themes.set(this.injector.get(ArenaThemeService)));
  }

  protected toggle(): void {
    this.themes()?.toggle();
  }
}
