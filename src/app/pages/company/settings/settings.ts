import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import {
  ArenaAlert,
  ArenaKeyValue,
  ArenaKeyValueRow,
  ArenaPageHead,
} from '@dravensoft/arena-angular';
import { Agreements } from '../../../domain/agreements';
import { Businesses } from '../../../domain/businesses';
import { Catalog } from '../../../domain/catalog';
import { Geography } from '../../../domain/geography';
import { Loads } from '../../../domain/loads';
import { Session } from '../../../domain/session';

@Component({
  selector: 'app-company-settings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [ArenaPageHead, ArenaKeyValue, ArenaAlert],
  templateUrl: './settings.html',
})
export class CompanySettings {
  private readonly agreements = inject(Agreements);
  private readonly catalog = inject(Catalog);
  private readonly geography = inject(Geography);
  private readonly loads = inject(Loads);
  private readonly session = inject(Session);

  protected readonly businesses = inject(Businesses);

  protected readonly companyId = computed(() => this.session.companyId() ?? '');

  protected readonly company = computed(() => this.businesses.companyById(this.companyId()));

  protected readonly isImporter = computed(() => this.company()?.type === 'importadora');

  protected readonly branches = computed(() => this.businesses.branchesOf(this.companyId()));

  protected readonly capacities = computed(() => {
    const ids = new Set(this.branches().map((one) => one.id));

    return this.loads.all().filter((one) => ids.has(one.fromBranchId));
  });

  protected readonly minLoad = computed(() => {
    const sizes = this.capacities().map((one) => one.capacity);

    return sizes.length > 0 ? Math.min(...sizes) : 0;
  });

  protected readonly facts = computed<readonly ArenaKeyValueRow[]>(() => {
    const company = this.company();

    if (!company) {
      return [];
    }

    return [
      {
        term: 'Tipo de negocio',
        value: company.type === 'restaurante' ? 'Restaurante' : 'Importadora',
      },
      { term: 'Desde', value: company.since, numeric: true },
      { term: 'Sucursales', value: this.branches().length.toString(), numeric: true },
      {
        term: 'Ciudades',
        value: this.businesses
          .citiesOf(this.companyId())
          .map((one) => this.geography.nameOf(one))
          .join(', '),
      },
      {
        term: 'Artículos publicados',
        value: this.catalog.ofCompany(this.companyId()).length.toString(),
        numeric: true,
      },
      {
        term: 'Riders con acuerdo',
        value: this.agreements
          .ofCompany(this.companyId())
          .filter((one) => one.state === 'activo')
          .length.toString(),
        numeric: true,
      },
      { term: 'Calificación', value: company.rating.toString(), numeric: true },
      { term: 'Reseñas', value: company.reviewCount.toString(), numeric: true },
    ];
  });
}
