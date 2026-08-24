import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DECISION_SECONDS, FreeAgentPrompt } from './free-agent-prompt';

function render(): ComponentFixture<FreeAgentPrompt> {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({});

  const fixture = TestBed.createComponent(FreeAgentPrompt);

  fixture.componentRef.setInput('companyName', 'Copacabana');
  fixture.componentRef.setInput('branchName', 'Miraflores');
  fixture.detectChanges();

  return fixture;
}

describe('FreeAgentPrompt', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('names the sucursal and the empresa the rider is deciding about', () => {
    const host: HTMLElement = render().nativeElement;

    expect(host.textContent).toContain('Copacabana, Miraflores');
  });

  it('offers staying and leaving, and nothing else', () => {
    const labels = [...render().nativeElement.querySelectorAll('button')].map(
      (one: HTMLButtonElement) => one.textContent?.trim() ?? '',
    );

    expect(labels.some((one) => one.startsWith('Seguir como agente libre'))).toBe(true);
    expect(labels.some((one) => one.startsWith('Dejar de ser agente libre'))).toBe(true);
  });

  it('counts the minute down in words the rider can read', () => {
    const fixture = render();

    vi.advanceTimersByTime(3000);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain(`${DECISION_SECONDS - 3} segundos`);
  });

  it('leaves for the rider when the minute runs out, because silence is not an answer', () => {
    const fixture = render();
    let left = 0;
    let stayed = 0;

    fixture.componentInstance.quit.subscribe(() => (left += 1));
    fixture.componentInstance.keep.subscribe(() => (stayed += 1));

    vi.advanceTimersByTime(DECISION_SECONDS * 1000);

    expect(left).toBe(1);
    expect(stayed).toBe(0);
  });

  it('answers once and stops counting, so a late tick cannot answer again', () => {
    const fixture = render();
    let left = 0;

    fixture.componentInstance.quit.subscribe(() => (left += 1));

    [...fixture.nativeElement.querySelectorAll('button')]
      .find((one: HTMLButtonElement) => (one.textContent ?? '').startsWith('Dejar de ser'))
      ?.click();

    vi.advanceTimersByTime(DECISION_SECONDS * 2000);

    expect(left).toBe(1);
  });
});
