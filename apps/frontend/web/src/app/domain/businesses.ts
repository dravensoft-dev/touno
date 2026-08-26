import { Injectable, computed, inject, signal } from '@angular/core';
import { Branch, BusinessType, Company } from './businesses.model';
import { Card } from './payments.model';
import { Platform } from './platform';
import { atLeast } from './platform.model';
import { BRANCHES, COMPANIES } from './businesses.data';

@Injectable({ providedIn: 'root' })
export class Businesses {
  private readonly platform = inject(Platform);

  private readonly companyList = signal<readonly Company[]>(COMPANIES);
  private readonly branchList = signal<readonly Branch[]>(BRANCHES);

  readonly companies = this.companyList.asReadonly();

  readonly branches = this.branchList.asReadonly();

  readonly openBranches = computed(() => this.branches().filter((one) => one.open));

  companiesOfType(type: BusinessType): readonly Company[] {
    return this.companies().filter((one) => one.type === type);
  }

  companyById(id: string): Company | undefined {
    return this.companies().find((one) => one.id === id);
  }

  companyBySlug(slug: string): Company | undefined {
    return this.companies().find((one) => one.slug === slug);
  }

  branchById(id: string): Branch | undefined {
    return this.branches().find((one) => one.id === id);
  }

  branchesOf(companyId: string): readonly Branch[] {
    return this.branches().filter((one) => one.companyId === companyId);
  }

  branchesIn(cityId: string): readonly Branch[] {
    return this.branches().filter((one) => one.cityId === cityId);
  }

  bySlugPair(companySlug: string, branchSlug: string): Branch | undefined {
    const company = this.companyBySlug(companySlug);

    if (!company) {
      return undefined;
    }

    return this.branchesOf(company.id).find((one) => one.slug === branchSlug);
  }

  companyOfBranch(branchId: string): Company | undefined {
    const branch = this.branchById(branchId);

    return branch && this.companyById(branch.companyId);
  }

  cityOf(branchId: string): string {
    return this.branchById(branchId)?.cityId ?? '';
  }

  citiesOf(companyId: string): readonly string[] {
    return [...new Set(this.branchesOf(companyId).map((one) => one.cityId))];
  }

  hasBranchIn(companyId: string, cityId: string): boolean {
    return this.branchesOf(companyId).some((one) => one.cityId === cityId);
  }

  branchOfIn(companyId: string, cityId: string): Branch | undefined {
    return this.branchesOf(companyId).find((one) => one.cityId === cityId);
  }

  typeOfBranch(branchId: string): BusinessType | undefined {
    return this.companyOfBranch(branchId)?.type;
  }

  deliveryFeeOf(branchId: string): number {
    return atLeast(this.branchById(branchId)?.deliveryBob ?? 0, this.platform.minDeliveryFeeBob());
  }

  weatherFeeOf(companyId: string): number {
    return atLeast(this.companyById(companyId)?.weatherFeeBob ?? 0, this.platform.weatherFeeBob());
  }

  setOpen(branchId: string, open: boolean): void {
    this.branchList.update((list) =>
      list.map((one) => (one.id === branchId ? { ...one, open } : one)),
    );
  }

  setDeliveryFee(branchId: string, deliveryBob: number): void {
    const floor = this.platform.minDeliveryFeeBob();

    if (deliveryBob < floor) {
      throw new Error(`La tarifa de ${branchId} no puede bajar de ${floor}`);
    }

    this.branchList.update((list) =>
      list.map((one) => (one.id === branchId ? { ...one, deliveryBob } : one)),
    );
  }

  setWeatherFee(companyId: string, weatherFeeBob: number): void {
    const floor = this.platform.weatherFeeBob();

    if (weatherFeeBob < floor) {
      throw new Error(`La tarifa de clima de ${companyId} no puede bajar de ${floor}`);
    }

    this.companyList.update((list) =>
      list.map((one) => (one.id === companyId ? { ...one, weatherFeeBob } : one)),
    );
  }

  setCompanyCard(companyId: string, card: Card | undefined): void {
    this.companyList.update((list) =>
      list.map((one) => (one.id === companyId ? { ...one, card } : one)),
    );
  }

  setBranchCard(branchId: string, card: Card | undefined): void {
    this.branchList.update((list) =>
      list.map((one) => (one.id === branchId ? { ...one, card } : one)),
    );
  }
}
