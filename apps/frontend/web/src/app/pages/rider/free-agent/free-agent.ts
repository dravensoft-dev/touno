import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  ArenaAction,
  ArenaAlert,
  ArenaButton,
  ArenaCard,
  ArenaEmptyState,
  ArenaKeyValue,
  ArenaKeyValueRow,
  ArenaPageHead,
  ArenaSection,
  ArenaSwitch,
} from '@dravensoft/arena-angular';
import { Agreements } from '../../../domain/agreements';
import { Businesses } from '../../../domain/businesses';
import { Callouts } from '../../../domain/callouts';
import { Geography } from '../../../domain/geography';
import { Platform } from '../../../domain/platform';
import { Riders } from '../../../domain/riders';
import { Session } from '../../../domain/session';
import { Tracking } from '../../../domain/tracking';
import { FreeAgentCallout } from '../../../domain/callouts.model';
import { GeoPoint } from '../../../domain/geography.model';
import { riderPayOf, riderRatesOf, unitsBetween } from '../../../domain/pricing';
import { bs } from '../../../domain/format';
import { Notices } from '../../../layout/notices';
import { NearbyMap, NearbyPlace } from '../../../shared/nearby-map/nearby-map';
import { StateTag } from '../../../shared/state-tag/state-tag';

const SAMPLE_UNITS = 10;

@Component({
  selector: 'app-rider-free-agent',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [
    ArenaAction,
    ArenaPageHead,
    ArenaSection,
    ArenaSwitch,
    ArenaAlert,
    ArenaButton,
    ArenaCard,
    ArenaKeyValue,
    ArenaEmptyState,
    NearbyMap,
    StateTag,
  ],
  templateUrl: './free-agent.html',
})
export class RiderFreeAgent {
  private readonly router = inject(Router);
  private readonly agreements = inject(Agreements);
  private readonly businesses = inject(Businesses);
  private readonly geography = inject(Geography);
  private readonly notices = inject(Notices);
  private readonly platform = inject(Platform);
  private readonly riders = inject(Riders);
  private readonly session = inject(Session);
  private readonly tracking = inject(Tracking);

  protected readonly callouts = inject(Callouts);

  protected readonly riderId = computed(() => this.session.riderId() ?? '');

  protected readonly rider = computed(() => this.riders.byId(this.riderId()));

  protected readonly on = computed(() => this.rider()?.freeAgent === true);

  protected readonly online = computed(() => this.rider()?.online === true);

  protected readonly free = computed(() => this.agreements.freeToRoam(this.riderId()));

  protected readonly blocked = computed(() => {
    if (this.free()) {
      return undefined;
    }

    const owed = this.agreements.runsPendingOf(this.riderId());

    return owed > 0
      ? `Te quedan ${owed} carreras por cumplir. Mientras las debas, trabajas para quien te reclutó.`
      : 'Tienes un reclutamiento activo. Un agente libre no trabaja para nadie por acuerdo.';
  });

  protected readonly here = computed<GeoPoint | undefined>(() => {
    const rider = this.rider();

    return rider && this.geography.zoneOf(rider.cityId, rider.zones[0] ?? '')?.point;
  });

  protected readonly streets = computed(() => this.tracking.streetsOf(this.rider()?.cityId ?? ''));

  protected readonly holding = computed(() => this.callouts.holdingOf(this.riderId()));

  protected readonly host = computed(() => {
    const claim = this.holding();
    const callout = claim && this.callouts.byId(claim.calloutId);

    return callout && this.businesses.branchById(callout.branchId);
  });

  protected readonly hostCompany = computed(() =>
    this.businesses.companyById(this.host()?.companyId ?? ''),
  );

  protected readonly nearby = computed<readonly FreeAgentCallout[]>(() => {
    const rider = this.rider();
    const here = this.here();

    if (!rider || !here) {
      return [];
    }

    return this.callouts
      .open()
      .filter((one) => this.businesses.branchById(one.branchId)?.cityId === rider.cityId)
      .slice()
      .sort(
        (left, right) =>
          this.unitsTo(left) - this.unitsTo(right) || left.id.localeCompare(right.id),
      );
  });

  protected readonly places = computed<readonly NearbyPlace[]>(() =>
    this.nearby().map((one) => ({
      id: one.id,
      label: this.businesses.branchById(one.branchId)?.name ?? '',
      point: this.businesses.branchById(one.branchId)?.point ?? { x: 0, y: 0 },
      cuposLeft: this.callouts.cuposLeft(one),
    })),
  );

  protected branchName(callout: FreeAgentCallout): string {
    return this.businesses.branchById(callout.branchId)?.name ?? '';
  }

  protected companyName(callout: FreeAgentCallout): string {
    return this.businesses.companyById(callout.companyId)?.name ?? '';
  }

  protected cupos(callout: FreeAgentCallout): string {
    const left = this.callouts.cuposLeft(callout);

    return left === 1 ? 'Queda un cupo' : `Quedan ${left} cupos`;
  }

  protected pay(callout: FreeAgentCallout): string {
    const company = this.businesses.companyById(callout.companyId);
    const rates = riderRatesOf(
      'agente-libre',
      this.platform.config(),
      { baseBob: callout.fixedBob },
      { weatherFeeBob: company?.weatherFeeBob },
    );
    const paid = riderPayOf({
      rates,
      cityUnits: SAMPLE_UNITS,
      interurbanUnits: 0,
      adverseWeather: this.geography.isAdverse(this.rider()?.cityId ?? ''),
    });

    return `${bs(paid.baseBob)} fijos más ${bs(rates.cityRateBob)} por unidad del plano`;
  }

  protected readonly bond = computed<readonly ArenaKeyValueRow[]>(() => {
    const claim = this.holding();
    const callout = claim && this.callouts.byId(claim.calloutId);

    if (!claim || !callout) {
      return [];
    }

    return [
      { term: 'Sucursal', value: this.branchName(callout) },
      { term: 'Empresa', value: this.companyName(callout) },
      { term: 'Fija por carrera', value: bs(callout.fixedBob), numeric: true },
      { term: 'Zona', value: this.host()?.zone ?? '' },
    ];
  });

  protected toggle(): void {
    this.riders.setFreeAgent(this.riderId(), !this.on());
  }

  protected claim(callout: FreeAgentCallout): void {
    this.callouts.claim(callout.id, this.riderId(), this.free());
    this.notices.onTheWay(this.branchName(callout));
  }

  protected leave(): void {
    const claim = this.holding();
    const name = this.host()?.name ?? '';

    if (claim) {
      this.callouts.leave(claim.id);
      this.notices.leftTheCallout(name);
    }
  }

  protected toAgreements(): void {
    void this.router.navigateByUrl('/rider/acuerdos');
  }

  private unitsTo(callout: FreeAgentCallout): number {
    const here = this.here();
    const point = this.businesses.branchById(callout.branchId)?.point;

    return here && point ? unitsBetween(here, point) : Number.POSITIVE_INFINITY;
  }
}
