import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
} from '@angular/core';

@Component({
  selector: 'app-structured-data',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: none' },
  template: '',
})
export class StructuredData {
  private readonly document = inject(DOCUMENT);

  readonly key = input.required<string>();
  readonly schema = input.required<Record<string, unknown>>();

  private written: HTMLScriptElement | undefined;

  constructor() {
    effect(() => {
      const element = this.resolveElement(this.key());

      if (this.written !== undefined && this.written !== element) {
        this.written.remove();
      }

      this.written = element;
      element.textContent = serialize(this.schema());
    });

    inject(DestroyRef).onDestroy(() => {
      this.written?.remove();
      this.written = undefined;
    });
  }

  private resolveElement(key: string): HTMLScriptElement {
    const existing = this.document.head.querySelector<HTMLScriptElement>(selectorFor(key));

    if (existing) {
      return existing;
    }

    const created = this.document.createElement('script');
    created.type = 'application/ld+json';
    created.setAttribute('data-schema', key);
    this.document.head.appendChild(created);

    return created;
  }
}

function selectorFor(key: string): string {
  return `script[type="application/ld+json"][data-schema="${key}"]`;
}

function serialize(schema: Record<string, unknown>): string {
  return JSON.stringify(schema).replace(/</g, '\\u003c');
}
