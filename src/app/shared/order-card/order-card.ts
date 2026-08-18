import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { ArenaButton, ArenaCard } from '@dravensoft/arena-angular';
import { Order } from '../../domain/orders.model';
import { bs, hhmm } from '../../domain/format';

@Component({
  selector: 'app-order-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [ArenaCard, ArenaButton],
  templateUrl: './order-card.html',
  styleUrl: './order-card.css',
})
export class OrderCard {
  readonly order = input.required<Order>();
  readonly advanceLabel = input<string>();
  readonly rejectable = input(false);
  readonly headingLevel = input<'h2' | 'h3' | 'none'>('none');

  readonly advance = output<Order>();
  readonly reject = output<Order>();

  protected readonly total = computed(() => bs(this.order().totalBob));

  protected readonly promised = computed(() => hhmm(this.order().promisedAt));

  protected readonly items = computed(() =>
    this.order().lines.reduce((sum, line) => sum + line.qty, 0),
  );

  protected next(): void {
    this.advance.emit(this.order());
  }

  protected decline(): void {
    this.reject.emit(this.order());
  }
}
