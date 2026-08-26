import { APP_BASE_HREF } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Cart } from '../../../domain/cart';
import { Catalog } from '../../../domain/catalog';
import { Checkout } from '../../../domain/draft';
import { Session } from '../../../domain/session';
import { CheckoutPage } from './checkout';

function start(): { fixture: ComponentFixture<CheckoutPage>; host: HTMLElement } {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [provideRouter([]), { provide: APP_BASE_HREF, useValue: '/' }],
  });

  TestBed.inject(Session).enter('p-comprador');

  return { fixture: TestBed.createComponent(CheckoutPage), host: null as unknown as HTMLElement };
}

function withCart(productId: string, branchId: string): ComponentFixture<CheckoutPage> {
  const { fixture } = start();
  const catalog = TestBed.inject(Catalog);
  const product = catalog.byId(productId);

  TestBed.inject(Cart).add(product!, branchId);
  fixture.detectChanges();

  return fixture;
}

function addressField(fixture: ComponentFixture<CheckoutPage>): Element | null {
  const fields: Element[] = [...fixture.nativeElement.querySelectorAll('arena-input')];

  return fields.find((one) => one.getAttribute('label')?.includes('Dirección')) ?? null;
}

describe('CheckoutPage', () => {
  it('tells the buyer that a code which only pays the rider is not for him', () => {
    const fixture = withCart('pc-cuarto-pollo', 'b-copacabana-miraflores');

    TestBed.inject(Checkout).patch({ promotionCode: 'COPANOCHE' });
    fixture.detectChanges();

    const host: HTMLElement = fixture.nativeElement;

    expect(host.textContent).toContain('es un trato entre el negocio y sus riders');
    expect(TestBed.inject(Cart).discountBob()).toBe(0);
  });

  it('asks nothing when the cart is empty', () => {
    const { fixture } = start();

    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No hay nada que confirmar');
  });

  it('offers no choice at all when everything comes from the buyer own city', () => {
    const host: HTMLElement = withCart('pc-cuarto-pollo', 'b-copacabana-miraflores').nativeElement;

    expect(host.querySelector('arena-radio-group')).toBeNull();
    expect(host.querySelector('arena-input')).not.toBeNull();
  });

  it('offers the two endings the guide names when something comes from another city', () => {
    const host: HTMLElement = withCart('al-jean', 'b-ale-santa-cruz').nativeElement;
    const options = [...host.querySelectorAll('arena-radio')].map(
      (one) => one.getAttribute('value') ?? '',
    );

    expect(options).toEqual(['domicilio', 'sucursal']);
    expect(host.textContent).toContain('Entrega a domicilio');
    expect(host.textContent).toContain('Recojo en sucursal');
  });

  it('offers only sucursales of that empresa in the buyer city', () => {
    const fixture = withCart('al-jean', 'b-ale-santa-cruz');

    TestBed.inject(Checkout).patch({ delivery: 'sucursal' });
    fixture.detectChanges();

    const options = [...fixture.nativeElement.querySelectorAll('option')].map(
      (one: HTMLOptionElement) => one.textContent ?? '',
    );

    expect(options.some((one) => one.includes('Ale La Paz'))).toBe(true);
    expect(options.some((one) => one.includes('Ale Santa Cruz'))).toBe(false);
    expect(options.some((one) => one.includes('Andes'))).toBe(false);
  });

  it('asks for an address for a home delivery and never for a counter pickup', () => {
    const fixture = withCart('al-jean', 'b-ale-santa-cruz');

    expect(addressField(fixture)).not.toBeNull();

    TestBed.inject(Checkout).patch({ delivery: 'sucursal' });
    fixture.detectChanges();

    expect(addressField(fixture)).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Lleva tu código del pedido y tu carnet');
  });

  it('explains that a home delivery from another city arrives in two legs', () => {
    const host: HTMLElement = withCart('al-jean', 'b-ale-santa-cruz').nativeElement;

    expect(host.textContent).toContain('Llega en dos tramos');
    expect(host.textContent).toContain('esa sucursal te asigna un rider');
  });

  it('refuses to confirm until it knows where the parcel is going', () => {
    const fixture = withCart('al-jean', 'b-ale-santa-cruz');

    function confirm(): HTMLButtonElement | undefined {
      return [...fixture.nativeElement.querySelectorAll('button')].find((one: HTMLButtonElement) =>
        (one.textContent ?? '').includes('Confirmar'),
      );
    }

    expect(confirm()?.hasAttribute('disabled')).toBe(true);

    TestBed.inject(Checkout).patch({ address: 'Calle Los Cusis 310' });
    fixture.detectChanges();

    expect(confirm()?.hasAttribute('disabled')).toBe(true);

    TestBed.inject(Checkout).patch({ zoneName: 'Obrajes' });
    fixture.detectChanges();

    expect(confirm()?.hasAttribute('disabled')).toBe(false);
  });

  it('asks for the zone the distance is measured to, and only for a delivery to a door', () => {
    const host: HTMLElement = withCart('al-jean', 'b-ale-santa-cruz').nativeElement;

    expect(host.textContent).toContain('Tu zona');
    expect(host.textContent).toContain('se mide entre la sucursal y tu zona');
  });

  it('shows the buyer every term of what is charged, not one envio line', () => {
    const host: HTMLElement = withCart('al-jean', 'b-ale-santa-cruz').nativeElement;

    expect(host.textContent).toContain('Comisión de Touno');
    expect(host.textContent).toContain('Envío por distancia');
  });

  it('refuses a counter pickup until a sucursal is chosen', () => {
    const fixture = withCart('al-jean', 'b-ale-santa-cruz');

    TestBed.inject(Checkout).patch({ delivery: 'sucursal', address: 'no importa' });
    fixture.detectChanges();

    const confirm = [...fixture.nativeElement.querySelectorAll('button')].find(
      (one: HTMLButtonElement) => (one.textContent ?? '').includes('Confirmar'),
    );

    expect(confirm?.hasAttribute('disabled')).toBe(true);
  });
});
