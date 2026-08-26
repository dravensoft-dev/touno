import { Injectable, computed, inject, signal } from '@angular/core';
import { Businesses } from './businesses';
import { Platform } from './platform';
import { PROMOTIONS } from './promotions.data';
import { PlanLimits, limitsOf } from './businesses.model';
import { legUnderFloor } from './pricing';
import {
  PROMOTION_REASONS,
  Promotion,
  PromotionAsk,
  PromotionDraft,
  PromotionRefusal,
  live,
  promotionRefusal,
} from './promotions.model';

@Injectable({ providedIn: 'root' })
export class Promotions {
  private readonly businesses = inject(Businesses);

  private readonly platform = inject(Platform);

  private readonly list = signal<readonly Promotion[]>(PROMOTIONS);

  readonly all = this.list.asReadonly();

  readonly withRiderLeg = computed(() => this.all().filter((one) => one.riderLeg !== undefined));

  byCode(code: string): Promotion | undefined {
    const wanted = code.trim().toUpperCase();

    return this.all().find((one) => one.code === wanted);
  }

  ofCompany(companyId: string): readonly Promotion[] {
    return this.all().filter((one) => one.companyId === companyId);
  }

  liveOfCompany(companyId: string): readonly Promotion[] {
    return this.ofCompany(companyId).filter((one) => live(one));
  }

  activeCountOf(companyId: string): number {
    return this.ofCompany(companyId).filter((one) => one.active).length;
  }

  limitsFor(companyId: string): PlanLimits {
    return limitsOf(this.businesses.companyById(companyId)?.plan ?? 'basico');
  }

  roomFor(companyId: string): boolean {
    return this.activeCountOf(companyId) < this.limitsFor(companyId).activePromotions;
  }

  refusalOf(code: string, ask: PromotionAsk): PromotionRefusal | undefined {
    return promotionRefusal(this.byCode(code), ask);
  }

  reasonOf(code: string, ask: PromotionAsk): string | undefined {
    const refusal = this.refusalOf(code, ask);

    return refusal && PROMOTION_REASONS[refusal];
  }

  toggle(code: string): void {
    const promotion = this.byCode(code);

    if (!promotion) {
      return;
    }

    if (!promotion.active && !this.roomFor(promotion.companyId)) {
      throw new Error(
        `Tu plan admite ${this.limitsFor(promotion.companyId).activePromotions} promociones encendidas a la vez`,
      );
    }

    this.list.update((all) =>
      all.map((one) => (one.code === code ? { ...one, active: !one.active } : one)),
    );
  }

  spend(code: string): void {
    const promotion = this.byCode(code);

    if (!promotion?.discount) {
      return;
    }

    this.list.update((all) =>
      all.map((one) => (one.code === promotion.code ? { ...one, uses: one.uses + 1 } : one)),
    );
  }

  create(draft: PromotionDraft): Promotion {
    const code = draft.code.trim().toUpperCase();

    if (code === '') {
      throw new Error('Una promoción sin código no la puede escribir nadie');
    }

    if (this.byCode(code)) {
      throw new Error(`El código ${code} ya está en uso`);
    }

    if (!draft.discount && !draft.riderLeg) {
      throw new Error('Una promoción tiene que descontar al comprador o pagarle al rider');
    }

    if (draft.discount) {
      if (draft.discount.value <= 0) {
        throw new Error('Una promoción que no descuenta nada no es una promoción');
      }

      if (draft.discount.kind !== 'amount' && draft.discount.value > 100) {
        throw new Error('Un porcentaje no pasa de 100');
      }
    }

    if (draft.limit < 1) {
      throw new Error('Una promoción sin usos es una puerta cerrada');
    }

    const limits = this.limitsFor(draft.companyId);

    if (!this.roomFor(draft.companyId)) {
      throw new Error(`Tu plan admite ${limits.activePromotions} promociones encendidas a la vez`);
    }

    if (draft.riderLeg) {
      if (!limits.riderLegs) {
        throw new Error('La pata de rider es del plan Marca');
      }

      if (legUnderFloor(draft.riderLeg, this.platform.config())) {
        const floor = this.platform.riderBaseBob()[draft.riderLeg.mode];

        throw new Error(`La fija de la promoción no puede bajar de ${floor} Bs`);
      }
    }

    const promotion: Promotion = {
      code,
      companyId: draft.companyId,
      label: draft.label,
      uses: 0,
      limit: draft.limit,
      active: true,
      until: draft.until,
      discount: draft.discount,
      riderLeg: draft.riderLeg,
    };

    this.list.update((all) => [promotion, ...all]);

    return promotion;
  }
}
