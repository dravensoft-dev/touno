import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import {
  ArenaButton,
  ArenaKeyValue,
  ArenaKeyValueRow,
  ArenaPageHead,
  ArenaProgressBar,
} from '@dravensoft/arena-angular';
import { Drivers } from '../../../domain/drivers';
import { Hiring } from '../../../domain/hiring';
import { Session } from '../../../domain/session';
import { bs, fecha } from '../../../domain/format';

@Component({
  selector: 'app-driver-offer-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [ArenaPageHead, ArenaKeyValue, ArenaProgressBar, ArenaButton],
  templateUrl: './offer-detail.html',
})
export class DriverOfferDetail {
  private readonly router = inject(Router);
  private readonly drivers = inject(Drivers);
  private readonly hiring = inject(Hiring);
  private readonly session = inject(Session);

  readonly id = input.required<string>();

  protected readonly me = computed(
    () =>
      this.drivers.bySlug(this.session.profile()?.slug ?? 'marco-quispe') ?? this.drivers.all()[0],
  );

  protected readonly offer = computed(() => {
    const offer = this.hiring.byId(this.id());

    if (!offer) {
      throw new Error(`Unknown hiring offer: ${this.id()}`);
    }

    return offer;
  });

  protected readonly facts = computed<readonly ArenaKeyValueRow[]>(() => {
    const offer = this.offer();

    return [
      { term: 'Negocio', value: offer.businessName },
      { term: 'Tipo', value: offer.businessKind },
      { term: 'Carreras', value: String(offer.rides), numeric: true },
      { term: 'Tarifa por carrera', value: bs(offer.perRideBob), numeric: true },
      { term: 'Vigente hasta', value: fecha(`${offer.validUntil}T00:00:00`) },
      { term: 'Estado', value: offer.state },
    ];
  });

  protected readonly total = computed<ArenaKeyValueRow>(() => ({
    term: 'Compromiso total',
    value: bs(this.offer().totalBob),
    numeric: true,
  }));

  protected readonly progress = computed(() =>
    Math.round((this.offer().ridesUsed / this.offer().rides) * 100),
  );

  protected accept(): void {
    this.hiring.accept(this.id(), this.me().id);
    void this.router.navigateByUrl('/conductor/ofertas');
  }

  protected reject(): void {
    this.hiring.reject(this.id(), this.me().id);
    void this.router.navigateByUrl('/conductor/ofertas');
  }
}
