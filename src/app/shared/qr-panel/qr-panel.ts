import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-qr-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
    <div class="qr arena-stack arena-stack--group">
      <div class="qr__frame" role="img" [attr.aria-label]="'Código QR de pago para ' + reference()">
        <span class="qr__corner qr__corner--tl"></span>
        <span class="qr__corner qr__corner--tr"></span>
        <span class="qr__corner qr__corner--bl"></span>
      </div>
      <p class="qr__reference arena-num">{{ reference() }}</p>
      <p class="qr__hint">{{ hint() }}</p>
    </div>
  `,
  styles: `
    .qr {
      align-items: center;
    }

    .qr__frame {
      position: relative;
      width: 100%;
      max-width: calc(var(--grid-min) - var(--sp-6));
      aspect-ratio: 1;
      border: var(--bw-surface) solid var(--edge-surface);
      border-radius: var(--r-control);
      background: repeating-linear-gradient(
        45deg,
        var(--fill-track) 0 6px,
        var(--fill-surface-sunken) 6px 12px
      );
    }

    .qr__corner {
      position: absolute;
      width: var(--sp-10);
      height: var(--sp-10);
      border: var(--bw-strong) solid var(--ink-heading);
      background: var(--fill-surface);
    }

    .qr__corner--tl {
      inset-block-start: var(--sp-3);
      inset-inline-start: var(--sp-3);
    }

    .qr__corner--tr {
      inset-block-start: var(--sp-3);
      inset-inline-end: var(--sp-3);
    }

    .qr__corner--bl {
      inset-block-end: var(--sp-3);
      inset-inline-start: var(--sp-3);
    }

    .qr__reference {
      margin: 0;
      font-size: var(--fs-lg);
      font-weight: var(--fw-control);
      letter-spacing: var(--track-eyebrow);
      color: var(--ink-heading);
    }

    .qr__hint {
      margin: 0;
      font-size: var(--fs-sm);
      color: color-mix(in oklab, var(--ink-muted) var(--level-ink-muted), transparent);
    }
  `,
})
export class QrPanel {
  readonly reference = input.required<string>();
  readonly hint = input('Escanea con tu banco o billetera móvil');
}
