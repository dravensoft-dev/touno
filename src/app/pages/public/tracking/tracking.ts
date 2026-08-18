import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import {
  ArenaActions,
  ArenaAlert,
  ArenaButton,
  ArenaFallback,
  ArenaFigure,
  ArenaKeyValue,
  ArenaKeyValueRow,
  ArenaPageHead,
} from '@dravensoft/arena-angular';
import { ArenaMetadataService } from '@dravensoft/arena-angular/metadata';
import { Shipping } from '../../../domain/shipping';
import { bs, fecha, hhmm } from '../../../domain/format';
import { PickupCode } from '../../../shared/pickup-code/pickup-code';
import { ShipmentTimeline } from '../../../shared/shipment-timeline/shipment-timeline';
import { StatusTag } from '../../../shared/status-tag/status-tag';
import { StructuredData } from '../../../seo/structured-data';
import { SITE_ORIGIN } from '../../../seo/site';

@Component({
  selector: 'app-tracking',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [
    ArenaPageHead,
    ArenaActions,
    ArenaFigure,
    ArenaFallback,
    ArenaKeyValue,
    ArenaAlert,
    ArenaButton,
    ShipmentTimeline,
    PickupCode,
    StatusTag,
    StructuredData,
  ],
  templateUrl: './tracking.html',
})
export class Tracking {
  private readonly shipping = inject(Shipping);
  private readonly metadata = inject(ArenaMetadataService);

  readonly guia = input.required<string>();

  protected readonly shipment = computed(() => {
    const shipment = this.shipping.bySlug(this.guia());

    if (!shipment) {
      throw new Error(`Unknown shipment: ${this.guia()}`);
    }

    return shipment;
  });

  protected readonly branch = computed(() =>
    this.shipping.branchById(this.shipment().destination.branchId),
  );

  protected readonly carrier = computed(() => this.shipping.carrierById(this.shipment().carrierId));

  protected readonly arrived = computed(() =>
    ['listo-para-recoger', 'entregado'].includes(this.shipment().state),
  );

  protected readonly owed = computed(
    () => this.shipment().payer === 'destinatario' && !this.shipment().paid,
  );

  protected readonly headline = computed(() => {
    const shipment = this.shipment();

    if (shipment.state === 'entregado') {
      return 'Entregado';
    }

    if (shipment.state === 'listo-para-recoger') {
      return `Llegó a ${shipment.destination.city}`;
    }

    if (shipment.state === 'en-bus') {
      return 'Tu paquete está en bus';
    }

    return 'Tu paquete está en camino';
  });

  protected readonly facts = computed<readonly ArenaKeyValueRow[]>(() => {
    const shipment = this.shipment();
    const branch = this.branch();

    return [
      { term: 'Guía', value: shipment.guia, numeric: true },
      { term: 'Contenido', value: `${shipment.content} · ${shipment.weightKg} kg` },
      {
        term: 'Recorrido',
        value: `${shipment.origin.city} → ${shipment.destination.city}`,
      },
      { term: 'Sucursal', value: branch ? `${branch.name} · ${branch.desk}` : '—' },
      { term: 'Horario', value: branch ? branch.window : '—' },
      {
        term: 'Llega',
        value: `${fecha(shipment.etaAt)} · ${hhmm(shipment.etaAt)}`,
        numeric: true,
      },
    ];
  });

  protected readonly schema = computed<Record<string, unknown>>(() => {
    const shipment = this.shipment();

    return {
      '@context': 'https://schema.org',
      '@type': 'ParcelDelivery',
      trackingNumber: shipment.guia,
      trackingUrl: `${SITE_ORIGIN}/seguimiento/${shipment.slug}`,
      expectedArrivalUntil: shipment.etaAt,
      deliveryAddress: {
        '@type': 'PostalAddress',
        addressLocality: shipment.destination.city,
        addressCountry: 'BO',
      },
      carrier: { '@type': 'Organization', name: this.carrier()?.name ?? 'Touno' },
    };
  });

  protected readonly total = computed(() => bs(this.shipment().totalBob));

  constructor() {
    effect(() => {
      const shipment = this.shipment();

      this.metadata.apply({
        title: `Seguimiento ${shipment.guia}`,
        description: `Dónde está la encomienda ${shipment.guia} de ${shipment.origin.city} a ${shipment.destination.city}, hito por hito.`,
        canonical: `/seguimiento/${shipment.slug}`,
        type: 'website',
        robots: 'index,follow',
      });
    });
  }
}
