import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { StructuredData } from './structured-data';

@Component({
  imports: [StructuredData],
  template: '<app-structured-data [key]="key()" [schema]="schema()" />',
})
class Host {
  readonly key = signal('branch');
  readonly schema = signal<Record<string, unknown>>({ '@type': 'Restaurant' });
}

function scriptFor(key: string): HTMLScriptElement | null {
  return document.head.querySelector(`script[type="application/ld+json"][data-schema="${key}"]`);
}

describe('StructuredData', () => {
  it('writes the schema into the head under its key', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();

    expect(scriptFor('branch')?.textContent).toBe('{"@type":"Restaurant"}');
  });

  it('escapes a closing tag, so the payload cannot end the script early', () => {
    const fixture = TestBed.createComponent(Host);

    fixture.componentInstance.schema.set({ name: '</script>' });
    fixture.detectChanges();

    expect(scriptFor('branch')?.textContent).toBe('{"name":"\\u003c/script>"}');
  });

  it('takes the old script away when the key changes, so no key outlives its page', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();

    fixture.componentInstance.key.set('company');
    fixture.detectChanges();

    expect(scriptFor('branch')).toBeNull();
    expect(scriptFor('company')).not.toBeNull();
  });

  it('cleans up without reading its inputs, because a destroy has already cleared them', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();

    expect(() => fixture.destroy()).not.toThrow();
    expect(scriptFor('branch')).toBeNull();
  });
});
