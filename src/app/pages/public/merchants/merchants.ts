import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import {
  ArenaEmptyState,
  ArenaGrid,
  ArenaInput,
  ArenaPageHead,
  ArenaSelect,
  ArenaSelectOption,
} from '@dravensoft/arena-angular';
import { Marketplace } from '../../../domain/marketplace';
import { MerchantKind } from '../../../domain/marketplace.model';
import { MerchantCard } from '../../../shared/merchant-card/merchant-card';
import { StructuredData } from '../../../seo/structured-data';
import { SITE_ORIGIN } from '../../../seo/site';

@Component({
  selector: 'app-merchants',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [
    ArenaPageHead,
    ArenaSelect,
    ArenaInput,
    ArenaGrid,
    ArenaEmptyState,
    MerchantCard,
    StructuredData,
  ],
  templateUrl: './merchants.html',
})
export class Merchants {
  private readonly marketplace = inject(Marketplace);

  readonly kind = input.required<MerchantKind>();

  protected readonly city = signal('todas');
  protected readonly term = signal('');

  protected readonly title = computed(() =>
    this.kind() === 'restaurante' ? 'Restaurantes' : 'Importadoras',
  );

  protected readonly subtitle = computed(() =>
    this.kind() === 'restaurante'
      ? 'Pide y recibe con un conductor de la red, en tu ciudad.'
      : 'Compra y recibe con guía, código de retiro y seguimiento por hitos.',
  );

  protected readonly all = computed(() => this.marketplace.byKind(this.kind()));

  protected readonly cityOptions = computed<readonly ArenaSelectOption[]>(() => [
    { value: 'todas', label: 'Todas las ciudades' },
    ...[...new Set(this.all().map((one) => one.city))]
      .sort()
      .map((one) => ({ value: one, label: one })),
  ]);

  protected readonly results = computed(() => {
    const needle = this.term().trim().toLowerCase();
    const city = this.city();

    return this.all().filter((one) => {
      const matchesCity = city === 'todas' || one.city === city;
      const matchesTerm =
        needle === '' ||
        one.name.toLowerCase().includes(needle) ||
        one.tags.some((tag) => tag.toLowerCase().includes(needle));

      return matchesCity && matchesTerm;
    });
  });

  protected readonly listSchema = computed<Record<string, unknown>>(() => ({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: this.title(),
    numberOfItems: this.all().length,
    itemListElement: this.all().map((one, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: one.name,
      url: `${SITE_ORIGIN}/${this.kind() === 'restaurante' ? 'restaurantes' : 'tiendas'}/${one.slug}`,
    })),
  }));

  protected pickCity(value: string): void {
    this.city.set(value);
  }

  protected search(value: string): void {
    this.term.set(value);
  }
}
