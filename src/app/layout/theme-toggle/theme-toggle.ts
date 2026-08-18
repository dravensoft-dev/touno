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
    <arena-icon-button
      icon="ph-bold ph-circle-half"
      label="Cambiar entre tema claro y oscuro"
      variant="ghost"
      (click)="toggle()"
    />
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
