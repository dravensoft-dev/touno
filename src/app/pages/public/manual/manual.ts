import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  ArenaBreadcrumbs,
  ArenaCard,
  ArenaCrumb,
  ArenaGrid,
  ArenaPageHead,
  ArenaSection,
} from '@dravensoft/arena-angular';
import { Manual } from '../../../domain/manual';
import { ManualEntry } from '../../../domain/manual.model';
import { StructuredData } from '../../../seo/structured-data';
import { SITE_ORIGIN } from '../../../seo/site';

@Component({
  selector: 'app-manual-index',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [ArenaBreadcrumbs, ArenaPageHead, ArenaSection, ArenaGrid, ArenaCard, StructuredData],
  templateUrl: './manual.html',
})
export class ManualIndex {
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly manual = inject(Manual);

  protected readonly entries = this.manual.all;

  protected readonly crumbs = computed<readonly ArenaCrumb[]>(() => [
    { label: 'Inicio', href: this.location.prepareExternalUrl('/') },
    { label: 'Manual' },
  ]);

  protected readonly schema = computed<Record<string, unknown>>(() => ({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': `${SITE_ORIGIN}/manual#lista`,
    name: 'Manual de Touno',
    inLanguage: 'es-BO',
    itemListElement: this.entries().map((entry, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: entry.title,
      url: `${SITE_ORIGIN}/manual/${entry.role}`,
    })),
  }));

  protected hrefOf(entry: ManualEntry): string {
    return this.location.prepareExternalUrl(`/manual/${entry.role}`);
  }

  protected open(entry: ManualEntry): void {
    void this.router.navigateByUrl(`/manual/${entry.role}`);
  }

  protected goTo(crumb: ArenaCrumb): void {
    if (crumb.href) {
      void this.router.navigateByUrl(this.location.normalize(crumb.href));
    }
  }
}
