import { APP_BASE_HREF, DOCUMENT } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideArenaMetadata } from '@dravensoft/arena-angular/metadata';
import { MANUAL } from '../../../domain/manual.data';
import { SITE_ORIGIN } from '../../../seo/site';
import { ManualRole } from './manual-role';

function render(rol: string, base = '/'): ComponentFixture<ManualRole> {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      provideArenaMetadata({ origin: SITE_ORIGIN }),
      { provide: APP_BASE_HREF, useValue: base },
    ],
  });

  const fixture = TestBed.createComponent(ManualRole);

  fixture.componentRef.setInput('rol', rol);
  fixture.detectChanges();

  return fixture;
}

function schemaOf(rol: string): Record<string, never> {
  render(rol);

  const written = TestBed.inject(DOCUMENT).head.querySelector(
    `script[data-schema="manual-${rol}"]`,
  );

  return JSON.parse(written?.textContent ?? '{}');
}

describe('a manual chapter page', () => {
  it('draws both chapters complete for every role, with no tab to click first', () => {
    for (const entry of MANUAL) {
      const text = render(entry.role).nativeElement.textContent ?? '';

      for (const chapter of entry.chapters) {
        expect(text).toContain(chapter.title);
        expect(text).toContain(chapter.summary);

        for (const step of chapter.steps) {
          expect(text).toContain(step.title);
        }
      }
    }
  });

  it('names the two sections by their own labels', () => {
    const text = render('rider').nativeElement.textContent ?? '';

    expect(text).toContain('Tutorial');
    expect(text).toContain('Reputación');
  });

  it('writes what counts for and against out of the facts, not out of prose', () => {
    const text = render('rider').nativeElement.textContent ?? '';

    expect(text).toContain('Qué cuenta a favor');
    expect(text).toContain('Qué cuenta en contra');
    expect(text).toContain('Entregas cerradas dentro de la hora prometida');
    expect(text).toContain('Reclutamientos dejados con carreras pendientes');
  });

  it('leaves the operador without a counted list, because he answers for no record', () => {
    const text = render('operador').nativeElement.textContent ?? '';

    expect(text).not.toContain('Qué cuenta a favor');
    expect(text).toContain('El piso de reputación');
  });

  it('writes an Article that belongs to the manual, and no rating of any kind', () => {
    for (const entry of MANUAL) {
      const schema = schemaOf(entry.role);

      expect(schema['@type']).toBe('Article');
      expect(schema['inLanguage']).toBe('es-BO');
      expect(JSON.stringify(schema)).not.toContain('aggregateRating');
      expect(JSON.stringify(schema)).not.toContain('ratingValue');
      expect(JSON.stringify(schema)).not.toContain('FAQPage');
    }
  });

  it('dates itself from the fixed clock, never from the wall clock', () => {
    expect(schemaOf('rider')['dateModified']).toBe('2026-08-15');
  });

  it('refuses a role that does not exist, loudly', () => {
    expect(() => render('gerente-de-nada')).toThrow();
  });

  it('carries the base href into the crumbs when the site is served from a subpath', () => {
    const html = render('rider', '/touno/').nativeElement.innerHTML ?? '';

    expect(html).toContain('/touno/manual');
  });
});
