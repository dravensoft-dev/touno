import { APP_BASE_HREF } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Branch, Company } from '../../domain/businesses.model';
import { BranchCard } from './branch-card';

const COMPANY: Company = {
  id: 'c-ale',
  slug: 'importadora-ale',
  name: 'Importadora Ale',
  type: 'importadora',
  summary: 'Ropa y calzado por temporada.',
  categories: ['Ropa'],
  tags: ['Temporada'],
  since: '2011',
  plan: 'basico',
};

const BRANCH: Branch = {
  id: 'b-ale-la-paz',
  slug: 'la-paz',
  companyId: 'c-ale',
  name: 'Ale La Paz',
  cityId: 'la-paz',
  zone: 'Centro',
  address: 'Av. Buenos Aires 1290',
  phone: '2 245 6612',
  point: { x: 30, y: 36 },
  hours: [{ days: 'Lunes a viernes', opens: '08:30', closes: '20:00' }],
  open: true,
  prepMinutes: 60,
  deliveryBob: 10,
  managerName: 'Ale Quisbert',
  cover: '/img/branches/ale-la-paz.webp',
};

function render(
  base: string,
  branch: Branch = BRANCH,
  company: Company = COMPANY,
): ComponentFixture<BranchCard> {
  TestBed.configureTestingModule({
    providers: [provideRouter([]), { provide: APP_BASE_HREF, useValue: base }],
  });

  const fixture = TestBed.createComponent(BranchCard);

  fixture.componentRef.setInput('branch', branch);
  fixture.componentRef.setInput('company', company);
  fixture.componentRef.setInput('cityName', 'La Paz');
  fixture.detectChanges();

  return fixture;
}

function anchor(fixture: ComponentFixture<BranchCard>): HTMLAnchorElement | null {
  return fixture.nativeElement.querySelector('a');
}

describe('BranchCard', () => {
  it('links to the sucursal by both slugs, under the site root', () => {
    expect(anchor(render('/'))?.getAttribute('href')).toBe('/tiendas/importadora-ale/la-paz');
  });

  it('keeps the three segments under a base href, which routerLink cannot reach', () => {
    expect(anchor(render('/touno/'))?.getAttribute('href')).toBe(
      '/touno/tiendas/importadora-ale/la-paz',
    );
  });

  it('prefixes the cover too, because an img src is not a routerLink either', () => {
    const image: HTMLImageElement | null = render('/touno/').nativeElement.querySelector('img');

    expect(image?.getAttribute('src')).toBe('/touno/img/branches/ale-la-paz.webp');
  });

  it('falls back to a glyph when there is no photograph', () => {
    const fixture = render('/', { ...BRANCH, cover: undefined });
    const host: HTMLElement = fixture.nativeElement;

    expect(host.querySelector('img')).toBeNull();
    expect(host.querySelector('i')?.className).toContain('ph-package');
  });

  it('names the city and the zone, which is what tells two sucursales apart', () => {
    const host: HTMLElement = render('/').nativeElement;

    expect(host.textContent).toContain('La Paz');
    expect(host.textContent).toContain('Centro');
    expect(host.textContent).toContain('Ale La Paz');
  });

  it('says when the sucursal is closed rather than hiding it', () => {
    const host: HTMLElement = render('/', { ...BRANCH, open: false }).nativeElement;

    expect(host.textContent).toContain('Cerrada ahora');
  });

  it('marks a sucursal whose empresa is running a discount', () => {
    const host: HTMLElement = render('/').nativeElement;

    expect(host.textContent).toContain('Con promoción');
  });

  it('leaves the mark off an empresa with nothing running', () => {
    const host: HTMLElement = render('/', BRANCH, {
      ...COMPANY,
      id: 'c-illimani',
    }).nativeElement;

    expect(host.textContent).not.toContain('Con promoción');
  });
});
