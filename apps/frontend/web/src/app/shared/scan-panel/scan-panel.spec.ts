import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ScanPanel } from './scan-panel';

function render(): ComponentFixture<ScanPanel> {
  TestBed.configureTestingModule({});

  const fixture = TestBed.createComponent(ScanPanel);

  fixture.componentRef.setInput('title', 'Escanear el código');
  fixture.componentRef.setInput('simulated', 'TO-1042');
  fixture.detectChanges();

  return fixture;
}

function buttons(fixture: ComponentFixture<ScanPanel>): HTMLElement[] {
  return Array.from(fixture.nativeElement.querySelectorAll('button'));
}

describe('ScanPanel', () => {
  it('reports what the camera read', () => {
    const fixture = render();
    const read: string[] = [];

    fixture.componentInstance.scanned.subscribe((code) => read.push(code));
    buttons(fixture)[0].click();

    expect(read).toEqual(['TO-1042']);
  });

  it('takes a code typed by hand, so the camera is never the only way in', () => {
    const fixture = render();
    const read: string[] = [];
    const field: HTMLInputElement = fixture.nativeElement.querySelector('input');

    fixture.componentInstance.scanned.subscribe((code) => read.push(code));

    field.value = ' to-2201 ';
    field.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    buttons(fixture)[1].click();

    expect(read).toEqual(['TO-2201']);
  });

  it('reports nothing for an empty code', () => {
    const fixture = render();
    const read: string[] = [];

    fixture.componentInstance.scanned.subscribe((code) => read.push(code));
    buttons(fixture)[1].click();

    expect(read).toEqual([]);
  });

  it('decides nothing about what it read', () => {
    const fixture = render();

    expect(fixture.nativeElement.textContent).not.toContain('correcto');
    expect(fixture.nativeElement.textContent).not.toContain('incorrecto');
  });
});
