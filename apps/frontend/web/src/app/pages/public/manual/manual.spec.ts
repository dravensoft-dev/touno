import { APP_BASE_HREF, DOCUMENT } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideArenaMetadata } from '@dravensoft/arena-angular/metadata';
import { MANUAL } from '../../../domain/manual.data';
import { SITE_ORIGIN } from '../../../seo/site';
import { ManualIndex } from './manual';

function render(base = '/'): ComponentFixture<ManualIndex> {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      provideArenaMetadata({ origin: SITE_ORIGIN }),
      { provide: APP_BASE_HREF, useValue: base },
    ],
  });

  const fixture = TestBed.createComponent(ManualIndex);

  fixture.detectChanges();

  return fixture;
}

describe('the manual index', () => {
  it('lists every role exactly once', () => {
    const html = render().nativeElement.innerHTML ?? '';

    for (const entry of MANUAL) {
      expect(html.split(`/manual/${entry.role}"`).length - 1).toBe(1);
    }
  });

  it('writes an ItemList that names every chapter page', () => {
    render();

    const written = TestBed.inject(DOCUMENT).head.querySelector('script[data-schema="manual"]');
    const schema = JSON.parse(written?.textContent ?? '{}');

    expect(schema['@type']).toBe('ItemList');
    expect(schema['itemListElement'].length).toBe(MANUAL.length);
  });

  it('carries the base href into every card, because routerLink is not what draws them', () => {
    const html = render('/touno/').nativeElement.innerHTML ?? '';

    for (const entry of MANUAL) {
      expect(html).toContain(`/touno/manual/${entry.role}`);
    }
  });
});
