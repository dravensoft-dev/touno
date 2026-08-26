import { APP_BASE_HREF } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Cart } from '../../../domain/cart';
import { Catalog } from '../../../domain/catalog';
import { Session } from '../../../domain/session';
import { BuyerCart } from './cart';

function withCart(productId: string, branchId: string): ComponentFixture<BuyerCart> {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [provideRouter([]), { provide: APP_BASE_HREF, useValue: '/' }],
  });

  TestBed.inject(Session).enter('p-comprador');

  const product = TestBed.inject(Catalog).byId(productId);

  if (!product) {
    throw new Error(`No fixture named ${productId}`);
  }

  TestBed.inject(Cart).add(product, branchId);

  const fixture = TestBed.createComponent(BuyerCart);

  fixture.detectChanges();

  return fixture;
}

describe('BuyerCart', () => {
  it('sends the buyer on to the step where the code is asked, and says why it is there', () => {
    const host: HTMLElement = withCart('pc-saltena-carne', 'b-copacabana-miraflores').nativeElement;

    expect(host.textContent).toContain('código de promoción');
    expect(host.textContent).toContain('elijas cómo recibirlo');
    expect(host.textContent).toContain('Elegir cómo recibirlo');
  });

  it('shows no discount line while no promotion is applied', () => {
    const host: HTMLElement = withCart('pc-saltena-carne', 'b-copacabana-miraflores').nativeElement;

    expect(host.textContent).not.toContain('Descuento');
  });
});
