import { APP_BASE_HREF } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Merchant } from '../../domain/marketplace.model';
import { MerchantCard } from './merchant-card';

const MERCHANT: Merchant = {
  slug: 'pollos-copacabana',
  name: 'Pollos Copacabana',
  kind: 'restaurante',
  city: 'La Paz',
  zone: 'Miraflores',
  summary: 'Pollo broaster y salteñas.',
  cover: '/img/restaurantes/pollos-copacabana.webp',
  rating: 4.7,
  reviewCount: 1284,
  open: true,
  prepMinutes: 25,
  deliveryBob: 8,
  categories: ['Combos'],
  tags: ['Pollo'],
};

function render(baseHref: string): ComponentFixture<MerchantCard> {
  TestBed.configureTestingModule({
    providers: [provideRouter([]), { provide: APP_BASE_HREF, useValue: baseHref }],
  });

  const fixture = TestBed.createComponent(MerchantCard);

  fixture.componentRef.setInput('merchant', MERCHANT);
  fixture.detectChanges();

  return fixture;
}

function refs(fixture: ComponentFixture<MerchantCard>): readonly (string | null)[] {
  const host: HTMLElement = fixture.nativeElement;

  return [
    host.querySelector('a')?.getAttribute('href') ?? null,
    host.querySelector('img')?.getAttribute('src') ?? null,
  ];
}

describe('MerchantCard', () => {
  it('addresses the route and the cover from the root when the base href is the root', () => {
    expect(refs(render('/'))).toEqual([
      '/restaurantes/pollos-copacabana',
      '/img/restaurantes/pollos-copacabana.webp',
    ]);
  });

  it('carries the base href into both when the site is served from a subpath', () => {
    expect(refs(render('/touno/'))).toEqual([
      '/touno/restaurantes/pollos-copacabana',
      '/touno/img/restaurantes/pollos-copacabana.webp',
    ]);
  });
});
