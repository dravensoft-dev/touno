import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  ArenaAlert,
  ArenaButton,
  ArenaInput,
  ArenaPageHead,
  ArenaSection,
  ArenaSelect,
  ArenaSelectOption,
} from '@dravensoft/arena-angular';
import { Businesses } from '../../../domain/businesses';
import { Promotions } from '../../../domain/promotions';
import { Session } from '../../../domain/session';
import { limitsOf, withoutLimit } from '../../../domain/businesses.model';
import { WorkMode } from '../../../domain/agreements.model';
import { BuyerDiscount, PromotionKind, RiderLeg } from '../../../domain/promotions.model';
import { Notices } from '../../../layout/notices';

type Audience = 'compradores' | 'riders' | 'ambos';

const AUDIENCES: readonly ArenaSelectOption[] = [
  { value: 'compradores', label: 'Sólo para compradores' },
  { value: 'riders', label: 'Sólo para riders' },
  { value: 'ambos', label: 'Para compradores y para riders' },
];

const KINDS: readonly ArenaSelectOption[] = [
  { value: 'amount', label: 'Bs de descuento en los productos' },
  { value: 'percent', label: 'Porcentaje de los productos' },
  { value: 'delivery', label: 'Porcentaje del envío' },
];

const MODES: readonly ArenaSelectOption[] = [
  { value: 'agente-libre', label: 'Agente libre' },
  { value: 'normal', label: 'Normal' },
  { value: 'hora-pico', label: 'Hora pico' },
];

@Component({
  selector: 'app-company-promotion-new',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [ArenaPageHead, ArenaSection, ArenaInput, ArenaSelect, ArenaButton, ArenaAlert],
  templateUrl: './promotion-new.html',
})
export class CompanyPromotionNew {
  private readonly businesses = inject(Businesses);
  private readonly notices = inject(Notices);
  private readonly promotions = inject(Promotions);
  private readonly router = inject(Router);
  private readonly session = inject(Session);

  protected readonly audiences = AUDIENCES;
  protected readonly kinds = KINDS;
  protected readonly modes = MODES;

  protected readonly refused = signal<string | undefined>(undefined);

  protected readonly audience = signal<Audience>('compradores');
  protected readonly code = signal('');
  protected readonly label = signal('');
  protected readonly kind = signal<PromotionKind>('amount');
  protected readonly value = signal('');
  protected readonly limit = signal('');
  protected readonly until = signal('');
  protected readonly gate = signal('');

  protected readonly mode = signal<WorkMode>('normal');
  protected readonly perTrip = signal('');
  protected readonly bonusAfter = signal('');
  protected readonly bonus = signal('');
  protected readonly guaranteed = signal('');

  protected readonly companyId = computed(() => this.session.companyId() ?? '');

  protected readonly company = computed(() => this.businesses.companyById(this.companyId()));

  protected readonly plan = computed(() => limitsOf(this.company()?.plan ?? 'basico'));

  protected readonly room = computed(() => this.promotions.roomFor(this.companyId()));

  protected readonly forBuyers = computed(() => this.audience() !== 'riders');

  protected readonly forRiders = computed(() => this.audience() !== 'compradores');

  protected readonly capLabel = computed(() => {
    const cap = this.plan().activePromotions;

    return withoutLimit(cap) ? 'Sin tope en tu plan' : `Tu plan admite ${cap} encendidas`;
  });

  protected readonly ready = computed(() => {
    const named =
      this.code().trim() !== '' &&
      this.label().trim() !== '' &&
      Number(this.limit()) > 0 &&
      this.until().trim() !== '';

    const discounts = !this.forBuyers() || Number(this.value()) > 0;

    const pays =
      !this.forRiders() ||
      (Number(this.perTrip()) > 0 &&
        Number(this.bonusAfter()) > 0 &&
        Number(this.bonus()) > 0 &&
        Number(this.guaranteed()) > 0);

    return named && discounts && pays;
  });

  protected setAudience(value: string): void {
    this.audience.set(value as Audience);
  }

  protected setKind(value: string): void {
    this.kind.set(value as PromotionKind);
  }

  protected setMode(value: string): void {
    this.mode.set(value as WorkMode);
  }

  protected create(): void {
    if (!this.ready()) {
      return;
    }

    try {
      const made = this.promotions.create({
        companyId: this.companyId(),
        code: this.code(),
        label: this.label(),
        limit: Number(this.limit()),
        until: this.until(),
        discount: this.forBuyers() ? this.discountOf() : undefined,
        riderLeg: this.forRiders() ? this.legOf() : undefined,
      });

      this.refused.set(undefined);
      this.notices.promotionCreated(made.code);
      void this.router.navigateByUrl(
        `/empresa/promociones/${this.forBuyers() ? 'compradores' : 'riders'}`,
      );
    } catch (refusal) {
      this.refused.set(refusal instanceof Error ? refusal.message : '');
    }
  }

  private discountOf(): BuyerDiscount {
    const gate = Number(this.gate());

    return {
      kind: this.kind(),
      value: Number(this.value()),
      minReputationPct: gate > 0 ? gate : undefined,
    };
  }

  private legOf(): RiderLeg {
    return {
      mode: this.mode(),
      perTripBob: Number(this.perTrip()),
      bonusAfterRuns: Number(this.bonusAfter()),
      bonusBob: Number(this.bonus()),
      guaranteedBob: Number(this.guaranteed()),
    };
  }
}
