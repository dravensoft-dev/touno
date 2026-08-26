import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import {
  ArenaActions,
  ArenaAlert,
  ArenaButton,
  ArenaEmptyState,
  ArenaKeyValue,
  ArenaKeyValueRow,
  ArenaPageHead,
} from '@dravensoft/arena-angular';
import { Agreements } from '../../../domain/agreements';
import { Reputation } from '../../../domain/reputation';
import { Businesses } from '../../../domain/businesses';
import { Geography } from '../../../domain/geography';
import { Session } from '../../../domain/session';
import { PEAK_REASONS, kindLabel } from '../../../domain/agreements.model';
import { bs, fecha } from '../../../domain/format';
import { Notices } from '../../../layout/notices';
import { StateTag } from '../../../shared/state-tag/state-tag';

@Component({
  selector: 'app-rider-agreement-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [
    ArenaPageHead,
    ArenaActions,
    ArenaKeyValue,
    ArenaAlert,
    ArenaButton,
    ArenaEmptyState,
    StateTag,
  ],
  templateUrl: './agreement-detail.html',
})
export class RiderAgreementDetail {
  private readonly router = inject(Router);
  private readonly reputation = inject(Reputation);
  private readonly businesses = inject(Businesses);
  private readonly geography = inject(Geography);
  private readonly notices = inject(Notices);
  private readonly session = inject(Session);

  protected readonly agreements = inject(Agreements);

  readonly id = input('');

  protected readonly riderId = computed(() => this.session.riderId() ?? '');

  private readonly found = computed(() => this.agreements.byId(this.id()));

  protected readonly agreement = computed(() => {
    const agreement = this.found();

    return agreement && agreement.riderId === this.riderId() ? agreement : undefined;
  });

  protected readonly notMine = computed(() => this.found() !== undefined && !this.agreement());

  protected readonly blocked = computed(() => {
    const agreement = this.agreement();

    if (!agreement || agreement.kind !== 'hora-pico' || agreement.state !== 'pendiente') {
      return undefined;
    }

    const refusal = this.agreements.refusalFor(
      agreement.riderId,
      this.reputation.gated(agreement.riderId, {
        companyId: agreement.companyId,
        branchIds: agreement.branchIds,
        originBranchId: agreement.originBranchId,
      }),
      agreement.id,
    );

    return refusal ? PEAK_REASONS[refusal] : undefined;
  });

  protected readonly answerable = computed(() => {
    const agreement = this.agreement();

    return (
      agreement?.state === 'pendiente' &&
      agreement.initiatedBy === 'empresa' &&
      this.blocked() === undefined
    );
  });

  protected readonly peak = computed(() => this.agreement()?.kind === 'hora-pico');

  protected readonly runsPending = computed(() => this.agreements.runsPendingOf(this.riderId()));

  protected readonly waitingOnThem = computed(() => {
    const agreement = this.agreement();

    return agreement?.state === 'pendiente' && agreement.initiatedBy === 'rider';
  });

  protected readonly companyName = computed(
    () => this.businesses.companyById(this.agreement()?.companyId ?? '')?.name ?? '',
  );

  protected readonly branches = computed(() =>
    (this.agreement()?.branchIds ?? []).flatMap((id) => {
      const branch = this.businesses.branchById(id);

      return branch ? [branch] : [];
    }),
  );

  protected readonly facts = computed<readonly ArenaKeyValueRow[]>(() => {
    const agreement = this.agreement();

    if (!agreement) {
      return [];
    }

    return [
      { term: 'Empresa', value: this.companyName() },
      { term: 'Clase', value: kindLabel(agreement.kind) },
      { term: 'Por viaje', value: bs(agreement.perTripBob), numeric: true },
      {
        term: 'Carreras',
        value:
          agreement.state === 'activo' || agreement.state === 'cumplido'
            ? `${agreement.runsLeft} de ${agreement.runs}`
            : `${agreement.runs}`,
        numeric: true,
      },
      { term: 'Lo propuso', value: agreement.initiatedBy === 'empresa' ? 'La empresa' : 'Tú' },
      { term: 'Enviado', value: fecha(agreement.sentAt), numeric: true },
      { term: 'Vence', value: fecha(agreement.validUntil), numeric: true },
      ...this.branches().map((one) => ({
        term: one.name,
        value: `${one.address} · ${this.geography.nameOf(one.cityId)}`,
      })),
    ];
  });

  protected accept(): void {
    const agreement = this.agreement();

    if (agreement) {
      this.agreements.accept(agreement.id, 'rider', this.riderId());
      this.notices.agreementAccepted();
    }
  }

  protected reject(): void {
    const agreement = this.agreement();

    if (agreement) {
      this.agreements.reject(agreement.id, 'rider', this.riderId());
      this.notices.agreementRejected();
    }
  }

  protected back(): void {
    void this.router.navigateByUrl('/rider/acuerdos');
  }
}
