import { APP_BASE_HREF } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Catalog } from '../../../domain/catalog';
import { Session } from '../../../domain/session';
import { CompanyCatalogItem } from './catalog-item';

function render(id: string, profileId = 'p-empresa-importadora') {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [provideRouter([]), { provide: APP_BASE_HREF, useValue: '/' }],
  });

  TestBed.inject(Session).enter(profileId);

  const fixture: ComponentFixture<CompanyCatalogItem> = TestBed.createComponent(CompanyCatalogItem);

  fixture.componentRef.setInput('id', id);
  fixture.detectChanges();

  return fixture;
}

describe('CompanyCatalogItem', () => {
  it('tells the empresa exactly what is added on top of the price it writes', () => {
    const host: HTMLElement = render('al-jean').nativeElement;

    expect(host.textContent).toContain('Comisión de Touno');
    expect(host.textContent).toContain('envío por distancia desde');
    expect(host.textContent).toContain('Tú cobras el precio que escribiste, completo');
  });

  it('draws one input per sucursal only for an article priced by sucursal', () => {
    const brandWide: HTMLElement = render('al-jean').nativeElement;
    const perBranch: HTMLElement = render('al-campera').nativeElement;

    expect(brandWide.querySelectorAll('arena-input').length).toBe(1);
    expect(perBranch.querySelectorAll('arena-input').length).toBeGreaterThan(1);
  });

  it('drops every branch price when the empresa goes back to one price for the marca', () => {
    const fixture = render('al-campera');
    const catalog = TestBed.inject(Catalog);

    expect(catalog.pricesOf('al-campera').length).toBeGreaterThan(0);

    fixture.debugElement
      .query((one) => one.name === 'arena-switch')
      .componentInstance.requestChange.emit();
    fixture.detectChanges();

    expect(catalog.byId('al-campera')?.priceScope).toBe('marca');
    expect(catalog.pricesOf('al-campera')).toEqual([]);
  });

  it('refuses an article that belongs to another empresa', () => {
    expect(render('pc-combo-familiar').nativeElement.textContent).toContain('no es de tu empresa');
  });
});
