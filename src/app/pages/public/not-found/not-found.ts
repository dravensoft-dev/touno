import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ArenaEmptyState } from '@dravensoft/arena-angular';

@Component({
  selector: 'app-not-found',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [ArenaEmptyState],
  template: `
    <arena-empty-state
      headingLevel="h1"
      icon="ph-bold ph-map-pin-simple-area"
      title="Esta página no existe"
      message="Revisa la dirección o vuelve al inicio para seguir pidiendo."
    />
  `,
})
export class NotFound {}
