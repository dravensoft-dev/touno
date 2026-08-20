import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import {
  ArenaAction,
  ArenaButton,
  ArenaCard,
  ArenaDialog,
  ArenaFallback,
  ArenaFigure,
  ArenaFooter,
  ArenaIconButton,
  ArenaKeyValue,
  ArenaKeyValueRow,
  ArenaPersonRow,
  ArenaPeopleList,
  ArenaRadio,
  ArenaRadioGroup,
  ArenaTextarea,
} from '@dravensoft/arena-angular';
import { Drivers } from '../../../domain/drivers';
import { Shipping } from '../../../domain/shipping';
import { bs, fechaHora } from '../../../domain/format';
import { ShipmentHeader } from '../../../shared/shipment-header/shipment-header';
import { ShipmentTimeline } from '../../../shared/shipment-timeline/shipment-timeline';
import { Notices } from '../../../layout/notices';
import { StatusTag } from '../../../shared/status-tag/status-tag';
import { SITE_ORIGIN } from '../../../seo/site';

@Component({
  selector: 'app-importer-shipment-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [
    ArenaKeyValue,
    ArenaCard,
    ArenaFigure,
    ArenaFallback,
    ArenaIconButton,
    ArenaButton,
    ArenaPeopleList,
    ArenaPersonRow,
    ArenaAction,
    ArenaDialog,
    ArenaFooter,
    ArenaRadioGroup,
    ArenaRadio,
    ArenaTextarea,
    ShipmentHeader,
    ShipmentTimeline,
    StatusTag,
  ],
  templateUrl: './shipment-detail.html',
})
export class ImporterShipmentDetail {
  private readonly shipping = inject(Shipping);
  private readonly drivers = inject(Drivers);
  private readonly notices = inject(Notices);

  readonly guia = input.required<string>();

  protected readonly reporting = signal(false);
  protected readonly reason = signal('retraso');
  protected readonly note = signal('');

  protected readonly shipment = computed(() => {
    const shipment = this.shipping.bySlug(this.guia());

    if (!shipment) {
      throw new Error(`Unknown shipment: ${this.guia()}`);
    }

    return shipment;
  });

  protected readonly driver = computed(() => {
    const id = this.shipment().driverId;

    return id ? this.drivers.byId(id) : undefined;
  });

  protected readonly shareUrl = computed(
    () => `${SITE_ORIGIN.replace('https://', '')}/seguimiento/${this.shipment().slug}`,
  );

  protected readonly meta = computed(() => {
    const shipment = this.shipment();

    return `${shipment.recipient.name} · ${shipment.destination.city} · ${bs(shipment.totalBob)} ${
      shipment.paid ? 'pagado' : 'por cobrar'
    }`;
  });

  protected readonly facts = computed<readonly ArenaKeyValueRow[]>(() => {
    const shipment = this.shipment();
    const branch = this.shipping.branchById(shipment.destination.branchId);

    return [
      { term: 'Contenido', value: `${shipment.content} · ${shipment.weightKg} kg` },
      { term: 'Empresa', value: this.shipping.carrierById(shipment.carrierId)?.name ?? '—' },
      { term: 'Salida', value: shipment.departure, numeric: true },
      { term: 'Sucursal de destino', value: branch ? `${branch.name} · ${branch.desk}` : '—' },
      { term: 'Código de retiro', value: shipment.pickupCode, numeric: true },
      { term: 'Creado', value: fechaHora(shipment.createdAt), numeric: true },
    ];
  });

  protected openReport(): void {
    this.reporting.set(true);
  }

  protected closeReport(): void {
    this.reporting.set(false);
  }

  protected sendReport(): void {
    this.reporting.set(false);
    this.notices.reportSent();
  }
}
