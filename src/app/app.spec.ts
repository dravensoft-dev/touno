import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ARENA_MAIN_ID } from '@dravensoft/arena-angular';
import { App } from './app';

describe('App', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  it('puts the skip link ahead of everything else that can take focus', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const host: HTMLElement = fixture.nativeElement;
    const focusable = host.querySelectorAll<HTMLElement>('a[href], button');

    expect(focusable.length).toBeGreaterThan(0);
    expect(focusable[0].getAttribute('href')).toBe(`#${ARENA_MAIN_ID}`);
  });

  it('renders the main landmark the skip link points at', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const host: HTMLElement = fixture.nativeElement;

    expect(host.querySelector(`main#${ARENA_MAIN_ID}`)).not.toBeNull();
  });
});
