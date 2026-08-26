import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-brand-mark',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: block', 'aria-hidden': 'true' },
  template: `
    <svg viewBox="0 0 96 96" width="100%" height="100%" focusable="false">
      <rect class="mark__box" width="96" height="96" rx="22" />
      <rect class="mark__parcel" x="22" y="22" width="52" height="52" rx="9" />
      <rect class="mark__route" y="44" width="96" height="5" />
      <circle class="mark__knockout" cx="74" cy="46.5" r="15" />
      <circle class="mark__dot" cx="74" cy="46.5" r="10" />
    </svg>
  `,
  styles: `
    svg {
      display: block;
    }

    .mark__box,
    .mark__knockout {
      fill: var(--ink-heading);
    }

    .mark__parcel {
      fill: none;
      stroke: var(--fill-page);
      stroke-width: 5;
    }

    .mark__route,
    .mark__dot {
      fill: var(--color-secondary);
    }
  `,
})
export class BrandMark {}
