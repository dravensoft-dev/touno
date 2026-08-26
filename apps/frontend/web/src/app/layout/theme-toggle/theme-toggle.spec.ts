import { TestBed } from '@angular/core/testing';
import { ThemeToggle } from './theme-toggle';

describe('ThemeToggle', () => {
  it('draws both polarities, so the markup never depends on the theme', () => {
    const fixture = TestBed.createComponent(ThemeToggle);
    fixture.detectChanges();

    const host: HTMLElement = fixture.nativeElement;
    const buttons = [...host.querySelectorAll('button')];

    expect(buttons.map((one) => one.querySelector('i')?.className)).toEqual([
      'ph-bold ph-moon',
      'ph-bold ph-sun',
    ]);
    expect(buttons.every((one) => !!one.getAttribute('aria-label'))).toBe(true);
  });
});
