import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  ArenaAlert,
  ArenaButton,
  ArenaInput,
  ArenaKeyValue,
  ArenaKeyValueRow,
  ArenaPageHead,
  ArenaSection,
} from '@dravensoft/arena-angular';
import { Agreements } from '../../../domain/agreements';
import { Businesses } from '../../../domain/businesses';
import { Catalog } from '../../../domain/catalog';
import { Geography } from '../../../domain/geography';
import { Loads } from '../../../domain/loads';
import { Platform } from '../../../domain/platform';
import { Session } from '../../../domain/session';
import { bs } from '../../../domain/format';
import { CardDraft, cardLabel, completeCard } from '../../../domain/payments.model';
import { Notices } from '../../../layout/notices';

@Component({
  selector: 'app-company-settings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [ArenaPageHead, ArenaSection, ArenaKeyValue, ArenaAlert, ArenaInput, ArenaButton],
  templateUrl: './settings.html',
})
export class CompanySettings {
  private readonly agreements = inject(Agreements);
  private readonly catalog = inject(Catalog);
  private readonly geography = inject(Geography);
  private readonly loads = inject(Loads);
  private readonly notices = inject(Notices);
  private readonly platform = inject(Platform);
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

  protected readonly card = computed(() => this.company()?.card);

  protected readonly cardName = computed(() => {
    const card = this.card();

    return card ? cardLabel(card) : 'Ninguna registrada';
  });

  protected readonly weatherFloor = computed(() => this.platform.weatherFeeBob());

  protected readonly weatherFloorName = computed(() => bs(this.weatherFloor()));

  protected readonly weather = signal<string | null>(null);

  protected readonly weatherValue = computed(
    () => this.weather() ?? String(this.businesses.weatherFeeOf(this.companyId())),
  );

  protected readonly weatherBob = computed(() => Number(this.weatherValue()));

  protected readonly weatherReady = computed(() => this.weatherBob() >= this.weatherFloor());

  protected readonly draft = signal<CardDraft>({
    brand: '',
    last4: '',
    holder: '',
    expires: '',
  });

  protected readonly readyCard = computed(() => completeCard(this.draft()));

  protected onWeather(value: string): void {
    this.weather.set(value);
  }

  protected saveWeather(): void {
    if (!this.weatherReady()) {
      return;
    }

    this.businesses.setWeatherFee(this.companyId(), this.weatherBob());
    this.weather.set(null);
    this.notices.feeRaised();
  }

  protected onBrand(brand: string): void {
    this.draft.update((one) => ({ ...one, brand }));
  }

  protected onLast4(last4: string): void {
    this.draft.update((one) => ({ ...one, last4 }));
  }

  protected onHolder(holder: string): void {
    this.draft.update((one) => ({ ...one, holder }));
  }

  protected onExpires(expires: string): void {
    this.draft.update((one) => ({ ...one, expires }));
  }

  protected saveCard(): void {
    if (!this.readyCard()) {
      return;
    }

    const draft = this.draft();

    this.businesses.setCompanyCard(this.companyId(), {
      brand: draft.brand.trim(),
      last4: draft.last4.trim(),
      holder: draft.holder.trim(),
      expires: draft.expires.trim(),
    });

    this.draft.set({ brand: '', last4: '', holder: '', expires: '' });
    this.notices.cardSaved();
  }

  protected removeCard(): void {
    this.businesses.setCompanyCard(this.companyId(), undefined);
    this.notices.cardRemoved();
  }

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
