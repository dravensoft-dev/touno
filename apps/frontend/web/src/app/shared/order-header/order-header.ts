import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-order-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
    <div class="banner arena-stack arena-stack--group">
      <p class="banner__code arena-num">{{ code() }}</p>
      <h1 class="banner__line">{{ line() }}</h1>
      <p class="banner__meta">{{ meta() }}</p>
    </div>
  `,
  styles: `
    .banner {
      padding: var(--pad-surface);
      border: var(--bw-surface) solid var(--ink-heading);
      border-radius: var(--r-surface);
      background: var(--ink-heading);
      color: var(--fill-page);
    }

    .banner__code {
      margin: 0;
      font-size: var(--fs-sm);
      font-weight: var(--fw-control);
      letter-spacing: var(--track-eyebrow);
      opacity: 70%;
    }

    .banner__line {
      margin: 0;
      font-family: var(--ff-heading);
      font-size: var(--step-title-page);
      font-weight: var(--fw-heading);
      letter-spacing: var(--track-heading);
      line-height: var(--lh-heading);
      color: var(--fill-page);
    }

    .banner__meta {
      margin: 0;
      font-size: var(--fs-sm);
      opacity: 75%;
    }
  `,
})
export class OrderHeader {
  readonly code = input.required<string>();
  readonly line = input.required<string>();
  readonly meta = input.required<string>();
}
