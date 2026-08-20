import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  ArenaActions,
  ArenaEmptyState,
  ArenaGrid,
  ArenaInput,
  ArenaPageHead,
  ArenaSelect,
  ArenaSelectOption,
} from '@dravensoft/arena-angular';
import { Businesses } from '../../../domain/businesses';
import { Catalog } from '../../../domain/catalog';
import { Geography } from '../../../domain/geography';
import { BusinessType, pathOfType } from '../../../domain/businesses.model';
import { BranchCard } from '../../../shared/branch-card/branch-card';
import { StructuredData } from '../../../seo/structured-data';
import { SITE_ORIGIN } from '../../../seo/site';

@Component({
  selector: 'app-companies',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [
    ArenaPageHead,
    ArenaActions,
    ArenaSelect,
    ArenaInput,
    ArenaGrid,
    ArenaEmptyState,
    BranchCard,
    StructuredData,
  ],
  templateUrl: './companies.html',
})
export class Companies {
  private readonly router = inject(Router);
  private readonly catalog = inject(Catalog);

  protected readonly businesses = inject(Businesses);
  protected readonly geography = inject(Geography);

  readonly type = input.required<BusinessType>();

  protected readonly city = signal('todas');

  protected readonly term = signal('');

  protected readonly restaurant = computed(() => this.type() === 'restaurante');

  protected readonly cities = computed<readonly ArenaSelectOption[]>(() => [
    { value: 'todas', label: 'Todas las ciudades' },
    ...this.geography.all().map((one) => ({ value: one.id, label: one.name })),
  ]);

  protected readonly companies = computed(() => this.businesses.companiesOfType(this.type()));

  protected readonly branches = computed(() => {
    const needle = this.term().trim().toLowerCase();

    return this.businesses
      .branches()
      .filter((one) => this.businesses.typeOfBranch(one.id) === this.type())
      .filter((one) => this.city() === 'todas' || one.cityId === this.city())
      .filter((one) => {
        if (needle === '') {
          return true;
        }

        const company = this.businesses.companyById(one.companyId);

        return (
          one.name.toLowerCase().includes(needle) ||
          one.zone.toLowerCase().includes(needle) ||
          (company?.name.toLowerCase().includes(needle) ?? false)
        );
      });
  });

  protected readonly schema = computed<Record<string, unknown>>(() => ({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: this.restaurant() ? 'Restaurantes en Touno' : 'Importadoras en Touno',
    numberOfItems: this.companies().length,
    itemListElement: this.companies().map((company, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: company.name,
      url: `${SITE_ORIGIN}/${pathOfType(company.type)}/${company.slug}`,
    })),
  }));

  protected companyOf(branchId: string) {
    return this.businesses.companyOfBranch(branchId);
  }

  protected pickCity(value: string): void {
    this.city.set(value);
  }

  protected onTerm(value: string): void {
    this.term.set(value);
  }
}
