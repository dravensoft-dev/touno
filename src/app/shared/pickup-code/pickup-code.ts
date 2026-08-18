import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-pickup-code',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
    <p class="code arena-stack arena-stack--group">
      <span class="code__label">{{ label() }}</span>
      <span class="code__digits arena-num">{{ code() }}</span>
      @if (hint(); as text) {
        <span class="code__hint">{{ text }}</span>
      }
    </p>
  `,
  styles: `
    .code {
      margin: 0;
      align-items: center;
      padding: var(--pad-surface);
      border: var(--bw-surface) solid var(--edge-surface);
      border-radius: var(--r-surface);
      background: var(--fill-surface-sunken);
      text-align: center;
    }

    .code__label {
      font-family: var(--ff-eyebrow);
      font-size: var(--step-eyebrow);
      font-weight: var(--fw-eyebrow);
      letter-spacing: var(--track-eyebrow);
      text-transform: var(--tt-eyebrow);
      color: var(--ink-eyebrow);
    }

    .code__digits {
      font-size: var(--step-title-page);
      font-weight: var(--fw-heading);
      letter-spacing: var(--track-eyebrow);
      line-height: var(--lh-heading);
      color: var(--ink-heading);
    }

    .code__hint {
      font-size: var(--fs-sm);
      color: color-mix(in oklab, var(--ink-muted) var(--level-ink-muted), transparent);
    }
  `,
})
export class PickupCode {
  readonly code = input.required<string>();
  readonly label = input('Código de retiro');
  readonly hint = input<string>();
}
