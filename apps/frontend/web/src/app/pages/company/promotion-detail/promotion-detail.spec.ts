import { APP_BASE_HREF } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Session } from '../../../domain/session';
import { CompanyPromotionDetail } from './promotion-detail';

function render(profileId: string, code: string): ComponentFixture<CompanyPromotionDetail> {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [provideRouter([]), { provide: APP_BASE_HREF, useValue: '/' }],
  });

  TestBed.inject(Session).enter(profileId);

  const fixture = TestBed.createComponent(CompanyPromotionDetail);

  fixture.componentRef.setInput('code', code);
  fixture.detectChanges();

  return fixture;
}

describe('CompanyPromotionDetail', () => {
  it('refuses a promotion of another empresa, and says which refusal it is', () => {
    const host: HTMLElement = render('p-empresa-importadora', 'COPA10').nativeElement;

    expect(host.textContent).toContain('no es de tu empresa');
    expect(host.textContent).not.toContain('No encontramos esa promoción');
  });

  it('says a code that resolves to nothing does not exist, which is the other refusal', () => {
    const host: HTMLElement = render('p-empresa-importadora', 'NOEXISTE').nativeElement;

    expect(host.textContent).toContain('No encontramos esa promoción');
  });

  it('draws the three figures a rider needs before accepting less per carrera', () => {
    const host: HTMLElement = render('p-empresa-restaurante', 'COPAPICO').nativeElement;

    expect(host.textContent).toContain('La fija de la promoción');
    expect(host.textContent).toContain('Bono');
    expect(host.textContent).toContain('Mínimo garantizado');
    expect(host.textContent).toContain('Su tarifa de siempre contigo');
  });

  it('resolves the ordinary rate from what this empresa actually pays a rider today', () => {
    const host: HTMLElement = render('p-empresa-restaurante', 'COPAPICO').nativeElement;

    expect(host.textContent).toContain('Su tarifa de siempre contigo: Bs 16,00');
    expect(host.textContent).toContain('Bs 13,00');
  });

  it('shows the rider coming out ahead at the bonus and protected under it', () => {
    const rows = [
      ...render('p-empresa-restaurante', 'COPAPICO').nativeElement.querySelectorAll('tbody tr'),
    ].map((one) => (one as Element).textContent ?? '');

    expect(rows.some((one) => one.includes('5 carreras') && one.includes('Bs 280,00'))).toBe(true);
    expect(rows.some((one) => one.includes('20 carreras') && one.includes('Bs 460,00'))).toBe(true);
    expect(rows.some((one) => one.includes('30 carreras') && one.includes('Bs 590,00'))).toBe(true);
  });

  it('names the floor no promotion may go under', () => {
    const host: HTMLElement = render('p-empresa-restaurante', 'COPAPICO').nativeElement;

    expect(host.textContent).toContain('ninguna promoción puede bajar de ahí');
  });

  it('says a promotion with no rider leg leaves the rider exactly where he was', () => {
    const host: HTMLElement = render('p-empresa-restaurante', 'COPA10').nativeElement;

    expect(host.textContent).toContain('no compromete a ningún rider');
    expect(host.textContent).not.toContain('Mínimo garantizado');
  });

  it('tells the empresa that the discount comes out of its own net', () => {
    const host: HTMLElement = render('p-empresa-restaurante', 'COPA10').nativeElement;

    expect(host.textContent).toContain('Quién paga este descuento');
    expect(host.textContent).toContain('sale de tu neto');
  });
});
