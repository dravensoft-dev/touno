import { TestBed } from '@angular/core/testing';
import { Manual } from './manual';
import { MANUAL } from './manual.data';
import { ManualSection, pathOfRole, sectionLabel } from './manual.model';
import { REPUTATION_FACTS, factLabel, subjectOf } from './reputation.model';
import { PROFILES, Role } from './session';

const SECTIONS: readonly ManualSection[] = ['tutorial', 'reputacion'];

describe('the manual', () => {
  let manual: Manual;

  beforeEach(() => {
    manual = TestBed.inject(Manual);
  });

  it('carries one chapter set per role, and one role per chapter set', () => {
    const roles = new Set(PROFILES.map((one) => one.role));

    expect(MANUAL.length).toBe(roles.size);
    expect(new Set(MANUAL.map((one) => one.role)).size).toBe(MANUAL.length);

    for (const role of roles) {
      expect(manual.byRole(role)).toBeDefined();
    }
  });

  it('gives every role both a Tutorial and a Reputación chapter', () => {
    for (const entry of MANUAL) {
      for (const section of SECTIONS) {
        expect(manual.chapter(entry.role, section)).toBeDefined();
      }

      expect(entry.chapters.length).toBe(SECTIONS.length);
    }
  });

  it('names the two sections the reader sees, and nothing else', () => {
    expect(sectionLabel('tutorial')).toBe('Tutorial');
    expect(sectionLabel('reputacion')).toBe('Reputación');
  });

  it('writes every reputation chapter out of the facts themselves', () => {
    for (const entry of MANUAL) {
      const chapter = manual.chapter(entry.role, 'reputacion');

      for (const fact of chapter?.counted ?? []) {
        expect(factLabel(fact)).toBeDefined();
        expect(subjectOf(fact)).toBe(chapter?.subject);
      }
    }
  });

  it('names every fact Touno counts, so a new one cannot be added without a manual for it', () => {
    const named = MANUAL.flatMap(
      (entry) => manual.chapter(entry.role, 'reputacion')?.counted ?? [],
    );

    for (const fact of REPUTATION_FACTS) {
      expect(named, `${fact} is counted and no manual explains it`).toContain(fact);
    }
  });

  it('counts nothing in a tutorial chapter, because the facts belong to the other one', () => {
    for (const entry of MANUAL) {
      expect(manual.chapter(entry.role, 'tutorial')?.counted).toEqual([]);
    }
  });

  it('gives a reputation subject to every role that answers for a record, and none to the operador', () => {
    for (const entry of MANUAL) {
      const chapter = manual.chapter(entry.role, 'reputacion');

      if (entry.role === 'operador') {
        expect(chapter?.subject).toBeUndefined();
        expect(chapter?.counted).toEqual([]);
      } else {
        expect(chapter?.subject).toBeDefined();
        expect(chapter?.counted.length).toBeGreaterThan(0);
      }
    }
  });

  it('says out loud, in every reputation chapter, that losing signal counts against nobody', () => {
    const said = MANUAL.map((entry) => manual.chapter(entry.role, 'reputacion'))
      .map((chapter) => chapter?.steps.map((step) => step.body).join(' ') ?? '')
      .filter((body) => body.includes('señal'));

    expect(said.length).toBeGreaterThan(0);
  });

  it('gives every chapter a title, a summary, a step, something to gain and a limit', () => {
    for (const entry of MANUAL) {
      for (const chapter of entry.chapters) {
        expect(chapter.title.length).toBeGreaterThan(0);
        expect(chapter.summary.length).toBeGreaterThan(0);
        expect(chapter.steps.length).toBeGreaterThan(0);
        expect(chapter.gains.length).toBeGreaterThan(0);
        expect(chapter.limits.length).toBeGreaterThan(0);

        for (const step of chapter.steps) {
          expect(step.title.length).toBeGreaterThan(0);
          expect(step.body.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it('gives every role a title, a lede, a description and an icon for the page that draws it', () => {
    for (const entry of MANUAL) {
      expect(entry.title.length).toBeGreaterThan(0);
      expect(entry.lede.length).toBeGreaterThan(0);
      expect(entry.description.length).toBeGreaterThan(0);
      expect(entry.icon.startsWith('ph-')).toBe(true);
    }
  });

  it('says carreras and never puntos, because puntos is not a word Touno uses any more', () => {
    for (const entry of MANUAL) {
      const prose = [
        entry.lede,
        entry.description,
        ...entry.chapters.flatMap((one) => [
          one.summary,
          ...one.steps.flatMap((step) => [step.title, step.body]),
          ...one.gains,
          ...one.limits,
        ]),
      ].join(' ');

      expect(prose).not.toContain('puntos');
      expect(prose).not.toContain('punto de carrera');
    }
  });

  it('never promises a rating, because Touno has none', () => {
    for (const entry of MANUAL) {
      const prose = entry.chapters
        .flatMap((one) => one.steps.map((step) => step.body))
        .join(' ')
        .toLowerCase();

      expect(prose).not.toContain('reseña de');
      expect(prose).not.toContain('cinco estrellas');
    }
  });

  it('points every role at its own page, under one route', () => {
    for (const entry of MANUAL) {
      expect(manual.pathOf(entry.role)).toBe(`/manual/${entry.role}`);
      expect(pathOfRole(entry.role as Role)).toBe(manual.pathOf(entry.role));
    }
  });

  it('answers nothing for a role that does not exist', () => {
    expect(manual.byRole('gerente-de-nada')).toBeUndefined();
  });
});
