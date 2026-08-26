import { APP_BASE_HREF } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Promotions } from '../../../domain/promotions';
import { Session } from '../../../domain/session';
import { PromotionAudience } from '../../../shared/promotion-table/promotion-table';
import { CompanyPromotions } from './promotions';

function render(
  profileId: string,
  audience: PromotionAudience = 'compradores',
): ComponentFixture<CompanyPromotions> {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [provideRouter([]), { provide: APP_BASE_HREF, useValue: '/' }],
  });

  TestBed.inject(Session).enter(profileId);

  const fixture = TestBed.createComponent(CompanyPromotions);

  fixture.componentRef.setInput('audience', audience);
  fixture.detectChanges();

  return fixture;
}

function rows(fixture: ComponentFixture<CompanyPromotions>): readonly string[] {
  return [...fixture.nativeElement.querySelectorAll('tbody tr')].map(
    (one) => one.textContent ?? '',
  );
}

describe('CompanyPromotions', () => {
  it('lists the promotions of this empresa and nobody else', () => {
    const fixture = render('p-empresa-restaurante');
    const mine = TestBed.inject(Promotions)
      .ofCompany('c-copacabana')
      .filter((one) => one.discount !== undefined);

    expect(rows(fixture).length).toBe(mine.length);
    expect(rows(fixture).some((one) => one.includes('COPA10'))).toBe(true);
    expect(rows(fixture).some((one) => one.includes('ALEENVIO'))).toBe(false);
  });

  it('says out loud that the empresa pays the discount and the rider does not', () => {
    const host: HTMLElement = render('p-empresa-restaurante').nativeElement;

    expect(host.textContent).toContain('La promoción la pagas tú');
    expect(host.textContent).toContain('sin descontar');
    expect(host.textContent).toContain('no toca lo que cobra el rider');
  });

  it('names every state a promotion can be in, so the fixtures are walkable', () => {
    const text = rows(render('p-empresa-restaurante')).join(' ');

    expect(text).toContain('Corriendo');
    expect(text).toContain('Apagada');
  });

  it('shows the importadora its own plan and its own cap', () => {
    const host: HTMLElement = render('p-empresa-importadora').nativeElement;

    expect(host.textContent).toContain('Plus');
    expect(host.textContent).toContain('Tu plan admite 5 encendidas');
  });

  it('tells the empresa on the unlimited plan that it has no cap', () => {
    const host: HTMLElement = render('p-empresa-restaurante').nativeElement;

    expect(host.textContent).toContain('Sin tope en tu plan');
  });

  it('keeps a promotion that only pays the rider out of the buyer list', () => {
    const buyers = rows(render('p-empresa-restaurante', 'compradores')).join(' ');

    expect(buyers).toContain('COPA10');
    expect(buyers).not.toContain('COPANOCHE');
  });

  it('lists under the riders only what carries a rider leg', () => {
    const riders = rows(render('p-empresa-restaurante', 'riders')).join(' ');

    expect(riders).toContain('COPANOCHE');
    expect(riders).toContain('COPAPICO');
    expect(riders).not.toContain('COPA10');
  });
});
