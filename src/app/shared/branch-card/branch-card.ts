import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import {
  ArenaCard,
  ArenaFallback,
  ArenaFigure,
  ArenaMedia,
  ArenaTag,
} from '@dravensoft/arena-angular';
import { Branch, Company, pathOfType } from '../../domain/businesses.model';
import { bs } from '../../domain/format';

@Component({
  selector: 'app-branch-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [ArenaCard, ArenaFigure, ArenaMedia, ArenaFallback, ArenaTag],
  templateUrl: './branch-card.html',
  styleUrl: './branch-card.css',
})
export class BranchCard {
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  readonly branch = input.required<Branch>();
  readonly company = input.required<Company>();
  readonly cityName = input('');
  readonly headingLevel = input<'h2' | 'h3'>('h3');

  protected readonly path = computed(
    () => `/${pathOfType(this.company().type)}/${this.company().slug}/${this.branch().slug}`,
  );

  protected readonly href = computed(() => this.location.prepareExternalUrl(this.path()));

  protected readonly cover = computed(() => {
    const cover = this.branch().cover ?? this.company().cover;

    return cover ? this.location.prepareExternalUrl(cover) : undefined;
  });

  protected readonly fallbackIcon = computed(() =>
    this.company().type === 'restaurante' ? 'ph ph-fork-knife' : 'ph ph-package',
  );

  protected readonly delivery = computed(() => bs(this.branch().deliveryBob));

  protected open(): void {
    void this.router.navigateByUrl(this.path());
  }
}
