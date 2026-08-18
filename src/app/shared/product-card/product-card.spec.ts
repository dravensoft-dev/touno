import { APP_BASE_HREF } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Merchant, Product } from '../../domain/marketplace.model';
import { ProductCard } from './product-card';

const MERCHANT: Merchant = {
  slug: 'pollos-copacabana',
  name: 'Pollos Copacabana',
  kind: 'restaurante',
  city: 'La Paz',
  zone: 'Miraflores',
  summary: 'Pollo broaster y salteñas.',
  rating: 4.7,
  reviewCount: 1284,
  open: true,
  prepMinutes: 25,
  deliveryBob: 8,
  categories: ['Pollo'],
  tags: ['Pollo'],
};

const PRODUCT: Product = {
  id: 'pc-broaster-1-4',
  merchantSlug: 'pollos-copacabana',
  category: 'Pollo',
  name: 'Broaster 1/4 con papas',
  description: 'Presa de pollo broaster, papas fritas y ensalada de la casa.',
  priceBob: 32,
  available: true,
  featured: true,
  soldThisMonth: 412,
  variants: [],
  addons: [],
};

function render(merchant?: Merchant): ComponentFixture<ProductCard> {
  TestBed.configureTestingModule({
    providers: [provideRouter([]), { provide: APP_BASE_HREF, useValue: '/' }],
  });

  const fixture = TestBed.createComponent(ProductCard);

  fixture.componentRef.setInput('product', PRODUCT);

  if (merchant) {
    fixture.componentRef.setInput('merchant', merchant);
  }

  fixture.detectChanges();

  return fixture;
}

function names(fixture: ComponentFixture<ProductCard>, shop: string): boolean {
  const host: HTMLElement = fixture.nativeElement;

  return (host.textContent ?? '').includes(shop);
}

describe('ProductCard', () => {
  it('names the shop when the product travels in the feed', () => {
    expect(names(render(MERCHANT), MERCHANT.name)).toBe(true);
  });

  it('names no shop inside the shop own page', () => {
    expect(names(render(), MERCHANT.name)).toBe(false);
  });

  it('reports the product the buyer added', () => {
    const fixture = render(MERCHANT);
    const host: HTMLElement = fixture.nativeElement;
    const added: Product[] = [];

    fixture.componentInstance.add.subscribe((product) => added.push(product));
    host.querySelector('button')?.click();

    expect(added).toEqual([PRODUCT]);
  });
});
