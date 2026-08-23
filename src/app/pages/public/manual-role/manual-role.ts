import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import {
  ArenaBreadcrumbs,
  ArenaButton,
  ArenaCrumb,
  ArenaPageHead,
  ArenaSection,
} from '@dravensoft/arena-angular';
import { ArenaMetadataService } from '@dravensoft/arena-angular/metadata';
import { NOW } from '../../../domain/clock';
import { Manual } from '../../../domain/manual';
import { ManualChapter, sectionLabel } from '../../../domain/manual.model';
import { factLabel, weightOf } from '../../../domain/reputation.model';
import { Session } from '../../../domain/session';
import { StructuredData } from '../../../seo/structured-data';
import { SITE_ORIGIN } from '../../../seo/site';

@Component({
  selector: 'app-manual-role',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [ArenaBreadcrumbs, ArenaPageHead, ArenaSection, ArenaButton, StructuredData],
  templateUrl: './manual-role.html',
  styleUrl: './manual-role.css',
})
export class ManualRole {
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly metadata = inject(ArenaMetadataService);
  private readonly manual = inject(Manual);
  private readonly session = inject(Session);

  readonly rol = input('');

  protected readonly entry = computed(() => {
    const entry = this.manual.byRole(this.rol());

    if (!entry) {
      throw new Error(`Unknown manual role: ${this.rol()}`);
    }

    return entry;
  });

  protected readonly path = computed(() => `/manual/${this.entry().role}`);

  protected readonly crumbs = computed<readonly ArenaCrumb[]>(() => [
    { label: 'Inicio', href: this.location.prepareExternalUrl('/') },
    { label: 'Manual', href: this.location.prepareExternalUrl('/manual') },
    { label: this.entry().title },
  ]);

  protected readonly home = computed(() => this.session.profile()?.home);

  protected readonly schema = computed<Record<string, unknown>>(() => {
    const entry = this.entry();

    return {
      '@context': 'https://schema.org',
      '@type': 'Article',
      '@id': `${SITE_ORIGIN}${this.path()}#articulo`,
      headline: entry.title,
      description: entry.description,
      url: `${SITE_ORIGIN}${this.path()}`,
      inLanguage: 'es-BO',
      dateModified: NOW.slice(0, 10),
      isPartOf: { '@id': `${SITE_ORIGIN}/manual#lista` },
      publisher: { '@id': `${SITE_ORIGIN}/#organization` },
      hasPart: entry.chapters.map((one) => ({
        '@type': 'Article',
        headline: one.title,
        description: one.summary,
      })),
    };
  });

  constructor() {
    effect(() => {
      const entry = this.entry();

      this.metadata.apply({
        title: entry.title,
        description: entry.description,
        canonical: this.path(),
        robots: 'index,follow',
        type: 'article',
      });
    });
  }

  protected labelOf(chapter: ManualChapter): string {
    return sectionLabel(chapter.section);
  }

  protected countedIn(
    chapter: ManualChapter,
    weight: 'cumplido' | 'incumplido',
  ): readonly string[] {
    return chapter.counted.filter((one) => weightOf(one) === weight).map((one) => factLabel(one));
  }

  protected goTo(crumb: ArenaCrumb): void {
    if (crumb.href) {
      void this.router.navigateByUrl(this.location.normalize(crumb.href));
    }
  }

  protected goHome(): void {
    const home = this.home();

    if (home) {
      void this.router.navigateByUrl(home);
    }
  }
}
