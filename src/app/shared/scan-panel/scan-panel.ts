import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { ArenaButton, ArenaInput } from '@dravensoft/arena-angular';

@Component({
  selector: 'app-scan-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [ArenaButton, ArenaInput],
  templateUrl: './scan-panel.html',
  styleUrl: './scan-panel.css',
})
export class ScanPanel {
  readonly title = input.required<string>();
  readonly hint = input('Pide el código al comprador y apunta la cámara.');
  readonly busy = input(false);
  readonly simulated = input('');
  readonly scanned = output<string>();

  protected readonly typed = signal('');

  protected onTyped(value: string): void {
    this.typed.set(value);
  }

  protected scan(): void {
    this.scanned.emit(this.simulated());
  }

  protected confirm(): void {
    const code = this.typed().trim();

    if (code !== '') {
      this.scanned.emit(code.toUpperCase());
      this.typed.set('');
    }
  }
}
