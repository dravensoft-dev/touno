import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { ArenaIconButton } from '@dravensoft/arena-angular';

const GRID = 29;
const FINDER = 7;

interface Module {
  readonly x: number;
  readonly y: number;
}

@Component({
  selector: 'app-order-code',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [ArenaIconButton],
  templateUrl: './order-code.html',
  styleUrl: './order-code.css',
})
export class OrderCode {
  readonly code = input.required<string>();
  readonly caption = input('Tu código del pedido');
  readonly hint = input('Muéstralo cuando te entreguen. Nadie más puede cerrar tu pedido con él.');
  readonly copied = output<string>();

  protected readonly grid = GRID;
  protected readonly finder = FINDER;

  protected readonly corners: readonly Module[] = [
    { x: 0, y: 0 },
    { x: GRID - FINDER, y: 0 },
    { x: 0, y: GRID - FINDER },
  ];

  protected readonly modules = computed<readonly Module[]>(() => {
    const seed = seedOf(this.code());
    const cells: Module[] = [];
    let state = seed;

    for (let y = 0; y < GRID; y += 1) {
      for (let x = 0; x < GRID; x += 1) {
        state = (state * 1103515245 + 12345) % 2147483648;

        if (!inFinder(x, y) && state % 100 < 46) {
          cells.push({ x, y });
        }
      }
    }

    return cells;
  });

  protected send(): void {
    this.copied.emit(this.code());
  }
}

function seedOf(code: string): number {
  let seed = 7;

  for (const character of code) {
    seed = (seed * 31 + character.charCodeAt(0)) % 2147483648;
  }

  return seed;
}

function inFinder(x: number, y: number): boolean {
  const near = FINDER + 1;

  return (x < near && y < near) || (x >= GRID - near && y < near) || (x < near && y >= GRID - near);
}
