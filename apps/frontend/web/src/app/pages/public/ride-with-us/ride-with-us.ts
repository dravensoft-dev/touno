import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  ArenaActions,
  ArenaButton,
  ArenaGrid,
  ArenaHero,
  ArenaSection,
  ArenaStatCard,
} from '@dravensoft/arena-angular';
import { Businesses } from '../../../domain/businesses';
import { Geography } from '../../../domain/geography';
import { Riders } from '../../../domain/riders';
import { StructuredData } from '../../../seo/structured-data';
import { SITE_NAME, SITE_ORIGIN } from '../../../seo/site';

@Component({
  selector: 'app-ride-with-us',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [
    ArenaHero,
    ArenaActions,
    ArenaButton,
    ArenaSection,
    ArenaGrid,
    ArenaStatCard,
    StructuredData,
  ],
  templateUrl: './ride-with-us.html',
})
export class RideWithUs {
  private readonly router = inject(Router);
  private readonly businesses = inject(Businesses);
  private readonly geography = inject(Geography);
  private readonly riders = inject(Riders);

  protected readonly cities = computed(() => this.geography.all().length);

  protected readonly branches = computed(() => this.businesses.branches().length);

  protected readonly urban = computed(() => this.riders.ofRange('urbano').length);

  protected readonly schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${SITE_ORIGIN}/riders#page`,
    name: `Maneja con ${SITE_NAME}`,
    url: `${SITE_ORIGIN}/riders`,
    description:
      'Trabaja con tu moto, tu auto o tu camión. Eliges para qué sucursales trabajas y el acuerdo lo firman las dos partes.',
    inLanguage: 'es-BO',
    isPartOf: { '@id': `${SITE_ORIGIN}/#website` },
  };

  protected goTo(path: string): void {
    void this.router.navigateByUrl(path);
  }
}
