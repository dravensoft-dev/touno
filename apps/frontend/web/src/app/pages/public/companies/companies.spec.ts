import { APP_BASE_HREF } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Businesses } from '../../../domain/businesses';
import { Reputation } from '../../../domain/reputation';
import { BusinessType } from '../../../domain/businesses.model';
import { Companies } from './companies';

function render(type: BusinessType): ComponentFixture<Companies> {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [provideRouter([]), { provide: APP_BASE_HREF, useValue: '/' }],
  });

  const fixture = TestBed.createComponent(Companies);

  fixture.componentRef.setInput('type', type);
  fixture.detectChanges();

  return fixture;
}

describe('Companies', () => {
  it('draws the destacados in a band of their own, and says they were paid for', () => {
    const host: HTMLElement = render('restaurante').nativeElement;

    expect(host.textContent).toContain('Destacado');
    expect(host.textContent).toContain('pagaron por aparecer');
    expect(host.textContent).toContain('sigue ordenada por cumplimiento');
  });

  it('leaves the merit list complete, destacados included, so nothing is hidden by not paying', () => {
    const fixture = render('restaurante');
    const businesses = TestBed.inject(Businesses);
    const listed = businesses
      .branches()
      .filter((one) => businesses.typeOfBranch(one.id) === 'restaurante');
    const cards = fixture.nativeElement.querySelectorAll('app-branch-card');
    const featured = listed.filter((one) => one.featuredUntil !== undefined);

    expect(featured.length).toBeGreaterThan(0);
    expect(cards.length).toBe(listed.length + featured.length);
  });

  it('never shows a destacado of a sucursal under the reputation floor', () => {
    const fixture = render('restaurante');
    const reputation = TestBed.inject(Reputation);
    const shown = fixture.componentInstance as unknown as {
      featured: () => readonly { id: string }[];
    };

    for (const branch of shown.featured()) {
      expect(reputation.clears(branch.id)).toBe(true);
    }
  });
});
