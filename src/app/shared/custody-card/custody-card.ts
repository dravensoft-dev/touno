import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ArenaCard } from '@dravensoft/arena-angular';
import { OrderSheet } from '../../domain/orders.model';

@Component({
  selector: 'app-custody-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [ArenaCard],
  templateUrl: './custody-card.html',
  styleUrl: './custody-card.css',
})
export class CustodyCard {
  readonly sheet = input.required<OrderSheet>();
  readonly title = input('Quién responde por tu pedido');
  readonly headingLevel = input<'h2' | 'h3'>('h2');
}
