import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BuyerOrders } from './orders';

function menusOf(host: HTMLElement): HTMLElement[] {
  return [...host.querySelectorAll<HTMLElement>('arena-menu')];
}

describe('BuyerOrders row actions', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  it('hangs one overflow menu off every row', () => {
    const fixture = TestBed.createComponent(BuyerOrders);
    fixture.detectChanges();

    const host: HTMLElement = fixture.nativeElement;
    const rows = host.querySelectorAll('tr[arena-table-row]');

    expect(rows.length).toBeGreaterThan(0);
    expect(menusOf(host).length).toBe(rows.length);
  });

  it('names the order in the trigger, so two rows are told apart', () => {
    const fixture = TestBed.createComponent(BuyerOrders);
    fixture.detectChanges();

    const host: HTMLElement = fixture.nativeElement;
    const names = [...host.querySelectorAll('arena-menu button')].map((one) =>
      one.getAttribute('aria-label'),
    );

    expect(names.length).toBeGreaterThan(1);
    expect(new Set(names).size).toBe(names.length);
    expect(names.every((name) => name?.startsWith('Acciones del pedido '))).toBe(true);
  });
});
