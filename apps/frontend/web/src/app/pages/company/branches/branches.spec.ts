import { APP_BASE_HREF } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Businesses } from '../../../domain/businesses';
import { Session } from '../../../domain/session';
import { CompanyBranches } from './branches';

function render(profileId: string): ComponentFixture<CompanyBranches> {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [provideRouter([]), { provide: APP_BASE_HREF, useValue: '/' }],
  });

  TestBed.inject(Session).enter(profileId);

  const fixture = TestBed.createComponent(CompanyBranches);

  fixture.detectChanges();

  return fixture;
}

function rows(fixture: ComponentFixture<CompanyBranches>): readonly string[] {
  return [...fixture.nativeElement.querySelectorAll('tbody tr')].map(
    (one) => one.textContent ?? '',
  );
}

describe('CompanyBranches', () => {
  it('lists the sucursales of this empresa and nobody else', () => {
    const fixture = render('p-empresa-importadora');
    const mine = TestBed.inject(Businesses).branchesOf('c-ale');

    expect(rows(fixture).length).toBe(mine.length);

    for (const branch of mine) {
      expect(rows(fixture).some((one) => one.includes(branch.name))).toBe(true);
    }

    expect(rows(fixture).some((one) => one.includes('Andes'))).toBe(false);
  });

  it('tells an importadora where it cannot sell, because that is the hard rule', () => {
    const host: HTMLElement = render('p-empresa-importadora').nativeElement;

    expect(host.textContent).toContain('Dónde todavía no puedes vender');
    expect(host.textContent).toContain('Oruro');
    expect(host.textContent).toContain('Sucre');
  });

  it('does not say that to a restaurant, which sells only where it stands', () => {
    const host: HTMLElement = render('p-empresa-restaurante').nativeElement;

    expect(host.textContent).not.toContain('Dónde todavía no puedes vender');
  });

  it('tells a closed sucursal apart from one that is open and cannot dispatch', () => {
    const fixture = render('p-empresa-restaurante');
    const businesses = TestBed.inject(Businesses);

    expect(fixture.nativeElement.textContent).toContain('Cerrada');
    expect(fixture.nativeElement.textContent).not.toContain('Abierta, sin riders');

    businesses.setOpen('b-copacabana-cala-cala', true);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Abierta, sin riders');
    expect(fixture.nativeElement.textContent).toContain('no puede despachar');
  });

  it('counts the cities the empresa reaches', () => {
    const host: HTMLElement = render('p-empresa-importadora').nativeElement;

    expect(host.textContent).toContain('Sólo puedes vender a estas ciudades');
  });
});
