import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  ArenaAction,
  ArenaButton,
  ArenaDialog,
  ArenaEmptyState,
  ArenaFooter,
  ArenaInput,
  ArenaKeyValue,
  ArenaKeyValueRow,
  ArenaPageHead,
  ArenaPeopleList,
  ArenaPersonRow,
  ArenaSegmentOption,
  ArenaSegmentedControl,
  ArenaTag,
} from '@dravensoft/arena-angular';
import { Drivers } from '../../../domain/drivers';
import { Hiring } from '../../../domain/hiring';
import { Session } from '../../../domain/session';
import { Driver } from '../../../domain/drivers.model';
import { MerchantKind } from '../../../domain/marketplace.model';
import { bs } from '../../../domain/format';

@Component({
  selector: 'app-hire-drivers',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [
    ArenaPageHead,
    ArenaInput,
    ArenaSegmentedControl,
    ArenaPeopleList,
    ArenaPersonRow,
    ArenaAction,
    ArenaButton,
    ArenaTag,
    ArenaDialog,
    ArenaFooter,
    ArenaKeyValue,
    ArenaEmptyState,
  ],
  templateUrl: './hire-drivers.html',
})
export class HireDrivers {
  private readonly router = inject(Router);
  private readonly drivers = inject(Drivers);
  private readonly hiring = inject(Hiring);
  private readonly session = inject(Session);

  readonly base = input.required<string>();
  readonly businessKind = input.required<MerchantKind>();

  protected readonly term = signal('');
  protected readonly zone = signal('todas');
  protected readonly candidate = signal<Driver | null>(null);
  protected readonly rides = signal(20);

  protected readonly zoneOptions = computed<readonly ArenaSegmentOption[]>(() => [
    { value: 'todas', label: 'Todas' },
    ...this.drivers
      .zones()
      .slice(0, 5)
      .map((zone) => ({ value: zone, label: zone })),
  ]);

  protected readonly results = computed(() =>
    this.drivers.search(this.term(), this.zone() === 'todas' ? '' : this.zone()),
  );

  protected readonly slug = computed(() => this.session.profile()?.slug ?? '');

  protected readonly offerRows = computed<readonly ArenaKeyValueRow[]>(() => {
    const driver = this.candidate();

    if (!driver) {
      return [];
    }

    return [
      { term: 'Conductor', value: driver.name },
      { term: 'Tarifa por carrera', value: bs(driver.ratePerRideBob), numeric: true },
      { term: 'Carreras ofrecidas', value: String(this.rides()), numeric: true },
    ];
  });

  protected readonly offerTotal = computed<ArenaKeyValueRow>(() => ({
    term: 'Compromiso total',
    value: bs((this.candidate()?.ratePerRideBob ?? 0) * this.rides()),
    numeric: true,
  }));

  protected hiredWith(driver: Driver): boolean {
    return this.hiring.activeWith(this.slug(), driver.id) !== undefined;
  }

  protected pendingWith(driver: Driver): boolean {
    return this.hiring
      .ofBusiness(this.slug())
      .some((offer) => offer.driverId === driver.id && offer.state === 'pendiente');
  }

  protected search(value: string): void {
    this.term.set(value);
  }

  protected pickZone(value: string): void {
    this.zone.set(value);
  }

  protected propose(driver: Driver): void {
    this.candidate.set(driver);
    this.rides.set(20);
  }

  protected setRides(value: string): void {
    this.rides.set(Math.max(1, Number(value) || 1));
  }

  protected close(): void {
    this.candidate.set(null);
  }

  protected send(): void {
    const driver = this.candidate();

    if (!driver) {
      return;
    }

    this.hiring.send({
      businessSlug: this.slug(),
      businessName: this.session.profile()?.name ?? '',
      businessKind: this.businessKind(),
      driverId: driver.id,
      rides: this.rides(),
      perRideBob: driver.ratePerRideBob,
      validUntil: '2026-08-31',
      sentAt: '2026-08-18T09:00:00',
    });

    this.candidate.set(null);
  }

  protected openProfile(driver: Driver): void {
    void this.router.navigateByUrl(`${this.base()}/${driver.slug}`);
  }
}
