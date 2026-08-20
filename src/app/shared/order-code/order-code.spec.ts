import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrderCode } from './order-code';

function render(): ComponentFixture<OrderCode> {
  TestBed.configureTestingModule({});

  const fixture = TestBed.createComponent(OrderCode);

  fixture.componentRef.setInput('code', 'TO-1042');
  fixture.detectChanges();

  return fixture;
}

describe('OrderCode', () => {
  it('shows the code in the mono face, because a person will read it out', () => {
    const host: HTMLElement = render().nativeElement;
    const value = host.querySelector('.order-code__value .arena-num');

    expect(value?.textContent?.trim()).toBe('TO-1042');
  });

  it('names the drawing for a reader who cannot see it', () => {
    const host: HTMLElement = render().nativeElement;

    expect(host.querySelector('[role="img"]')?.getAttribute('aria-label')).toBe(
      'Código QR del pedido TO-1042',
    );
  });

  it('reports the code when it is copied', () => {
    const fixture = render();
    const copied: string[] = [];

    fixture.componentInstance.copied.subscribe((code) => copied.push(code));
    fixture.nativeElement.querySelector('button')?.click();

    expect(copied).toEqual(['TO-1042']);
  });

  it('draws the same modules for the same code, so prerender and hydration agree', () => {
    const first: HTMLElement = render().nativeElement;
    const drawn = first.querySelectorAll('.order-code__module').length;

    TestBed.resetTestingModule();

    const second: HTMLElement = render().nativeElement;

    expect(drawn).toBeGreaterThan(0);
    expect(second.querySelectorAll('.order-code__module').length).toBe(drawn);
  });

  it('draws its three finders, so it reads as a code and not as noise', () => {
    const host: HTMLElement = render().nativeElement;

    expect(host.querySelectorAll('.order-code__finder').length).toBe(3);
    expect(host.querySelectorAll('.order-code__pupil').length).toBe(3);
  });

  it('says the code belongs to the buyer', () => {
    const host: HTMLElement = render().nativeElement;

    expect(host.textContent).toContain('Nadie más puede cerrar tu pedido con él');
  });
});
