import { APP_BASE_HREF } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Geography } from '../../../domain/geography';
import { Session } from '../../../domain/session';
import { PlatformWeather } from './weather';

function render(): ComponentFixture<PlatformWeather> {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [provideRouter([]), { provide: APP_BASE_HREF, useValue: '/' }],
  });

  TestBed.inject(Session).enter('p-touno');

  const fixture = TestBed.createComponent(PlatformWeather);

  fixture.detectChanges();

  return fixture;
}

describe('PlatformWeather', () => {
  it('lists every city of the network with the weather it has now', () => {
    const fixture = render();
    const geography = TestBed.inject(Geography);
    const host: HTMLElement = fixture.nativeElement;

    for (const city of geography.all()) {
      expect(host.textContent).toContain(city.name);
    }

    expect(host.textContent).toContain('Clima desfavorable');
  });

  it('says that a counter pickup never pays the weather, because nobody went out', () => {
    expect(render().nativeElement.textContent).toContain('recojo en mostrador no lo paga');
  });

  it('turns a city weather on, which is what makes the fee walkable', () => {
    render();

    const geography = TestBed.inject(Geography);

    expect(geography.isAdverse('sucre')).toBe(false);

    geography.setWeather('sucre', 'adverso');

    expect(geography.isAdverse('sucre')).toBe(true);
  });
});
