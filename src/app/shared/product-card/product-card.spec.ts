import { APP_BASE_HREF } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Branch } from '../../domain/businesses.model';
import { Product } from '../../domain/catalog.model';
import { ProductCard } from './product-card';

const BRANCH: Branch = {
  id: 'b-copacabana-miraflores',
  slug: 'miraflores',
  companyId: 'c-copacabana',
  name: 'Copacabana Miraflores',
  cityId: 'la-paz',
  zone: 'Miraflores',
  address: 'Av. Busch 1420',
  phone: '2 224 8810',
  point: { x: 34, y: 41 },
  hours: [{ days: 'Lunes a domingo', opens: '11:00', closes: '22:30' }],
  open: true,
  prepMinutes: 25,
  deliveryBob: 8,
  managerName: 'Delia Mamani',
};

const PRODUCT: Product = {
  id: 'pc-cuarto-pollo',
  companyId: 'c-copacabana',
  category: 'Pollo',
  name: 'Cuarto de pollo con papas',
  description: 'Presa de pollo broaster, papas fritas y llajua.',
  priceBob: 38,
  priceScope: 'marca',
  featured: true,
  soldThisMonth: 906,
  variants: [],
  addons: [],
};

function render(inputs: Record<string, unknown> = {}): ComponentFixture<ProductCard> {
  TestBed.configureTestingModule({
    providers: [provideRouter([]), { provide: APP_BASE_HREF, useValue: '/' }],
  });

  const fixture = TestBed.createComponent(ProductCard);

  fixture.componentRef.setInput('product', PRODUCT);

  for (const [key, value] of Object.entries(inputs)) {
    fixture.componentRef.setInput(key, value);
  }

  fixture.detectChanges();

  return fixture;
}

describe('ProductCard', () => {
  it('names the sucursal when the product travels in the feed', () => {
    const host: HTMLElement = render({ branch: BRANCH }).nativeElement;

    expect(host.textContent).toContain('Copacabana Miraflores');
  });

  it('names no sucursal inside the sucursal own page', () => {
    const host: HTMLElement = render().nativeElement;

    expect(host.textContent).not.toContain('Copacabana Miraflores');
  });

  it('reports the product the buyer added', () => {
    const fixture = render({ branch: BRANCH });
    const added: Product[] = [];

    fixture.componentInstance.add.subscribe((product) => added.push(product));
    fixture.nativeElement.querySelector('button')?.click();

    expect(added).toEqual([PRODUCT]);
  });

  it('says a sucursal ran out, because availability belongs to the local', () => {
    const host: HTMLElement = render({ branch: BRANCH, available: false }).nativeElement;

    expect(host.textContent).toContain('Sin stock');
    expect(host.querySelector('button')?.hasAttribute('disabled')).toBe(true);
  });
});
