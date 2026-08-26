import { APP_BASE_HREF } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideArenaMetadata } from '@dravensoft/arena-angular/metadata';
import { Catalog } from '../../../domain/catalog';
import { BranchDetail } from './branch';
import { SITE_ORIGIN } from '../../../seo/site';

function render(
  empresa: string,
  sucursal: string,
  type = 'importadora',
  base = '/',
): ComponentFixture<BranchDetail> {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      provideArenaMetadata({ origin: SITE_ORIGIN }),
      { provide: APP_BASE_HREF, useValue: base },
    ],
  });

  const fixture = TestBed.createComponent(BranchDetail);

  fixture.componentRef.setInput('empresa', empresa);
  fixture.componentRef.setInput('sucursal', sucursal);
  fixture.componentRef.setInput('type', type);
  fixture.detectChanges();

  return fixture;
}

function schemaOf(empresa: string, sucursal: string, type = 'importadora'): Record<string, never> {
  render(empresa, sucursal, type);

  const script = document.head.querySelector(
    `script[data-schema="sucursal-${empresa}-${sucursal}"]`,
  );

  return JSON.parse(script?.textContent ?? '{}');
}

describe('BranchDetail', () => {
  it('emits a LocalBusiness with the address a local search wants', () => {
    const schema = schemaOf('importadora-ale', 'la-paz') as Record<string, never>;
    const address = schema['address'] as unknown as Record<string, string>;

    expect(schema['@type']).toBe('Store');
    expect(address['streetAddress']).toBe('Av. Buenos Aires 1290');
    expect(address['addressLocality']).toBe('La Paz');
    expect(address['addressCountry']).toBe('BO');
    expect(schema['telephone']).toBe('2 245 6612');
  });

  it('types a restaurant sucursal as a Restaurant', () => {
    expect(schemaOf('pollos-copacabana', 'miraflores', 'restaurante')['@type']).toBe('Restaurant');
  });

  it('never invents coordinates, because ours are viewBox units', () => {
    const schema = schemaOf('importadora-ale', 'la-paz');

    expect('geo' in schema).toBe(false);
    expect('hasMap' in schema).toBe(false);
  });

  it('points every sucursal at the empresa it belongs to', () => {
    const parent = schemaOf('importadora-ale', 'santa-cruz')[
      'parentOrganization'
    ] as unknown as Record<string, string>;

    expect(parent['name']).toBe('Importadora Ale');
    expect(parent['url']).toBe(`${SITE_ORIGIN}/tiendas/importadora-ale`);
  });

  it('offers only what this sucursal has, not the whole empresa catalogue', () => {
    const fixture = render('importadora-ale', 'cochabamba');
    const catalog = TestBed.inject(Catalog);
    const offers = JSON.parse(
      document.head.querySelector('script[data-schema="sucursal-importadora-ale-cochabamba"]')
        ?.textContent ?? '{}',
    )['makesOffer'] as { name: string }[];

    expect(offers.length).toBe(catalog.ofBranch('b-ale-cochabamba').length);
    expect(offers.length).toBeLessThan(catalog.ofCompany('c-ale').length);
    expect(offers.some((one) => one.name === 'Zapatilla urbana')).toBe(false);

    fixture.destroy();
  });

  it('states the opening hours in the form a crawler reads', () => {
    const hours = schemaOf('importadora-ale', 'la-paz')['openingHoursSpecification'] as unknown as {
      dayOfWeek: string[];
      opens: string;
    }[];

    expect(hours.length).toBeGreaterThan(0);
    expect(hours[0].dayOfWeek).toEqual(['Mo', 'Tu', 'We', 'Th', 'Fr']);
    expect(hours[0].opens).toBe('08:30');
  });

  it('names the sucursal and its city in the heading, so two locals never look alike', () => {
    const host: HTMLElement = render('importadora-ale', 'santa-cruz').nativeElement;

    expect(host.querySelector('h1')?.textContent).toContain('Ale Santa Cruz');
    expect(host.textContent).toContain('Calle Ayacucho 415');
  });

  it('carries the base href into a link to a sibling sucursal', () => {
    const fixture = render('importadora-ale', 'la-paz', 'importadora', '/touno/');
    const links = [...fixture.nativeElement.querySelectorAll('li a')].map(
      (one: HTMLAnchorElement) => one.getAttribute('href'),
    );

    expect(links.length).toBeGreaterThan(0);

    for (const href of links) {
      expect(href?.startsWith('/touno/tiendas/importadora-ale/')).toBe(true);
    }
  });

  it('tells a buyer in another city that this empresa can still reach him', () => {
    expect(render('importadora-ale', 'la-paz').nativeElement.textContent).toContain(
      'siempre que tenga sucursal en tu ciudad',
    );
  });
});
