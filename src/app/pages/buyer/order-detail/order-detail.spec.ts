import { APP_BASE_HREF } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Chat } from '../../../domain/chat';
import { Orders } from '../../../domain/orders';
import { BuyerOrderDetail } from './order-detail';

function render(slug: string): ComponentFixture<BuyerOrderDetail> {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [provideRouter([]), { provide: APP_BASE_HREF, useValue: '/' }],
  });

  const fixture = TestBed.createComponent(BuyerOrderDetail);

  fixture.componentRef.setInput('codigo', slug);
  fixture.detectChanges();

  return fixture;
}

function host(slug: string): HTMLElement {
  return render(slug).nativeElement;
}

function parties(slug: string): readonly string[] {
  return [...host(slug).querySelectorAll('.custody__title')].map(
    (one) => one.textContent?.trim() ?? '',
  );
}

describe('BuyerOrderDetail', () => {
  it('says so plainly when there is no such order', () => {
    expect(host('to-9999').textContent).toContain('No encontramos ese pedido');
  });

  it('shows a restaurant order its sucursal and its rider, and nothing else', () => {
    const drawn = parties('to-1043');

    expect(drawn.length).toBe(2);
    expect(drawn[0]).toContain('Copacabana Miraflores');
    expect(drawn[1]).toBe('Marco Quispe');
  });

  it('adds the local sucursal when the parcel is collected at a counter', () => {
    const drawn = parties('to-2206');

    expect(drawn.length).toBe(3);
    expect(drawn[0]).toContain('Andes Santa Cruz');
    expect(drawn[1]).toBe('Elías Poma');
    expect(drawn[2]).toContain('Andes La Paz');
  });

  it('adds the local rider too when it comes to the door', () => {
    const drawn = parties('to-2205');

    expect(drawn.length).toBe(4);
    expect(drawn[0]).toContain('Ale Santa Cruz');
    expect(drawn[1]).toBe('Hugo Barrientos');
    expect(drawn[2]).toContain('Ale La Paz');
    expect(drawn[3]).toBe('Marco Quispe');
  });

  it('draws the map while a rider is moving, and names him in words too', () => {
    const element = host('to-1043');

    expect(element.querySelector('app-route-map')).not.toBeNull();
    expect(element.querySelector('.map__rider')).not.toBeNull();
    expect(element.querySelector('figcaption')?.textContent).toContain('Marco Quispe');
  });

  it('says the connection was lost instead of freezing the rider in place', () => {
    const element = host('to-1044');

    expect(element.querySelector('.map__lost')).not.toBeNull();
    expect(element.querySelector('.map__rider')).toBeNull();
    expect(element.textContent).toContain('Última conexión registrada');
  });

  it('draws no map before a rider is assigned, and says what it is waiting for', () => {
    const element = host('to-1042');

    expect(element.querySelector('app-route-map')).toBeNull();
    expect(element.textContent).toContain('En espera de rider');
  });

  it('draws no map once the code has been scanned', () => {
    expect(host('to-1045').querySelector('app-route-map')).toBeNull();
  });

  it('says how many parcels the truck is short of, rather than a mute wait', () => {
    const element = host('to-2203');

    expect(element.querySelector('app-route-map')).toBeNull();
    expect(element.textContent).toContain('En espera a más pedidos');
    expect(element.textContent).toContain('Faltan 3 pedidos');
  });

  it('names the custodian on the chat, and it is the one holding the parcel', () => {
    expect(host('to-1043').textContent).toContain('Hablas con Marco Quispe');
    expect(host('to-2206').textContent).toContain('Hablas con Andes La Paz');
  });

  it('shows the relevo in the conversation, not only in the parties list', () => {
    const notes = [...host('to-2205').querySelectorAll('.chat__note')].map(
      (one) => one.textContent ?? '',
    );

    expect(notes.length).toBeGreaterThanOrEqual(3);
    expect(notes.some((one) => one.includes('gerente de sucursal'))).toBe(true);
    expect(notes.some((one) => one.includes('Marco Quispe'))).toBe(true);
  });

  it('closes the composer once the order is done', () => {
    expect(host('to-1043').querySelector('arena-textarea')).not.toBeNull();
    expect(host('to-1045').querySelector('arena-textarea')).toBeNull();
  });

  it('shows the buyer his own code, and only one', () => {
    const element = host('to-1043');
    const codes = element.querySelectorAll('app-order-code');

    expect(codes.length).toBe(1);
    expect(element.querySelector('.order-code__value')?.textContent).toContain('TO-1043');
  });

  it('offers no code on an order the sucursal rejected', () => {
    expect(host('to-1046').querySelector('app-order-code')).toBeNull();
  });

  it('says where it is going, or where it is collected, but never both', () => {
    expect(host('to-1043').textContent).toContain('Llega a Calle 5 de Obrajes 120');
    expect(host('to-2206').textContent).toContain('Lo recoges en tu sucursal de La Paz');
  });

  it('appends what the buyer writes to his own thread, under his own name', () => {
    const fixture = render('to-1043');
    const chat = TestBed.inject(Chat);
    const threadId = TestBed.inject(Orders).bySlug('to-1043')?.threadId ?? '';
    const before = chat.byId(threadId)?.messages.length ?? 0;
    const field: HTMLTextAreaElement = fixture.nativeElement.querySelector('textarea');

    field.value = 'Ya bajo';
    field.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const buttons: HTMLElement[] = [...fixture.nativeElement.querySelectorAll('button')];

    buttons.find((one) => (one.textContent ?? '').includes('Enviar'))?.click();
    fixture.detectChanges();

    expect(chat.byId(threadId)?.messages.length).toBe(before + 1);
    expect(chat.lastOf(threadId)?.author).toBe('comprador');
    expect(chat.lastOf(threadId)?.authorName).toBe('Rosa Villca');
  });
});
