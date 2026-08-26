import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  afterNextRender,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { ArenaConfirmDialog } from '@dravensoft/arena-angular';

export const DECISION_SECONDS = 60;

@Component({
  selector: 'app-free-agent-prompt',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [ArenaConfirmDialog],
  templateUrl: './free-agent-prompt.html',
  styleUrl: './free-agent-prompt.css',
})
export class FreeAgentPrompt {
  readonly companyName = input.required<string>();
  readonly branchName = input.required<string>();

  readonly keep = output<void>();
  readonly quit = output<void>();

  private ticking: ReturnType<typeof setInterval> | undefined;

  private readonly answered = signal(false);

  protected readonly secondsLeft = signal(DECISION_SECONDS);

  protected readonly where = computed(() => `${this.companyName()}, ${this.branchName()}`);

  protected readonly countdown = computed(() => {
    const left = this.secondsLeft();

    return left === 1 ? 'Queda 1 segundo' : `Quedan ${left} segundos`;
  });

  constructor() {
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => this.start());

    destroyRef.onDestroy(() => this.stop());
  }

  protected onKeep(): void {
    this.answer();
    this.keep.emit();
  }

  protected onQuit(): void {
    this.answer();
    this.quit.emit();
  }

  private start(): void {
    this.ticking = setInterval(() => {
      const left = this.secondsLeft() - 1;

      this.secondsLeft.set(Math.max(0, left));

      if (left <= 0) {
        this.onQuit();
      }
    }, 1000);
  }

  private stop(): void {
    if (this.ticking !== undefined) {
      clearInterval(this.ticking);
      this.ticking = undefined;
    }
  }

  private answer(): void {
    if (this.answered()) {
      return;
    }

    this.answered.set(true);
    this.stop();
  }
}
