import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EMPTY_STANDING, Standing } from '../../domain/reputation.model';
import { ReputationFigure } from './reputation-figure';

function standing(kept: number, total: number, pct: number): Standing {
  return { keptCount: kept, brokenCount: total - kept, totalCount: total, pct };
}

function render(inputs: Record<string, unknown>): ComponentFixture<ReputationFigure> {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({});

  const fixture = TestBed.createComponent(ReputationFigure);

  for (const [key, value] of Object.entries(inputs)) {
    fixture.componentRef.setInput(key, value);
  }

  fixture.detectChanges();

  return fixture;
}

describe('ReputationFigure', () => {
  it('says the figure is absent in words, rather than drawing a zero', () => {
    const host: HTMLElement = render({ standing: EMPTY_STANDING }).nativeElement;

    expect(host.textContent).toContain('Sin historial');
    expect(host.textContent).not.toContain('0 %');
  });

  it('never draws a percentage without saying what it is made of', () => {
    const host: HTMLElement = render({ standing: standing(40, 50, 80) }).nativeElement;

    expect(host.textContent).toContain('80');
    expect(host.textContent).toContain('40 de 50');
  });

  it('draws the total and the ways of working underneath it, when it is given them', () => {
    const modes = {
      byMode: {
        'agente-libre': standing(9, 10, 90),
        normal: standing(40, 50, 80),
        'hora-pico': EMPTY_STANDING,
      },
      total: standing(49, 60, 81),
    };
    const host: HTMLElement = render({ standing: modes.total, modes }).nativeElement;

    expect(host.textContent).toContain('Agente libre');
    expect(host.textContent).toContain('Reclutamiento normal');
  });

  it('omits a way of working with no history, rather than drawing it as a zero', () => {
    const modes = {
      byMode: {
        'agente-libre': EMPTY_STANDING,
        normal: standing(40, 50, 80),
        'hora-pico': EMPTY_STANDING,
      },
      total: standing(40, 50, 80),
    };
    const host: HTMLElement = render({ standing: modes.total, modes }).nativeElement;

    expect(host.textContent).toContain('Reclutamiento normal');
    expect(host.textContent).not.toContain('Agente libre');
  });

  it('draws no star and no glyph standing in for one', () => {
    const host: HTMLElement = render({ standing: standing(40, 50, 80) }).nativeElement;
    const star = String.fromCodePoint(0x2605);

    expect(host.textContent).not.toContain(star);
    expect(host.querySelector('svg')).toBeNull();
  });
});
