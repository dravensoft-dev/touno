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
import { Platform } from '../../../domain/platform';
import { PlatformConfig } from '../../../domain/platform.model';
import { bs, porcentaje } from '../../../domain/format';
import { Notices } from '../../../layout/notices';

interface Knob {
  readonly key: keyof PlatformConfig;
  readonly label: string;
  readonly hint: string;
}

const KNOBS: readonly Knob[] = [
  {
    key: 'commissionPct',
    label: 'Comisión de Touno',
    hint: 'Porcentaje del precio del artículo. Lo paga el comprador y es de Touno.',
  },
  {
    key: 'minDeliveryFeeBob',
    label: 'Envío base mínimo',
    hint: 'El piso que ninguna empresa puede bajar. Sí puede subirlo para sus sucursales.',
  },
  {
    key: 'cityRateBob',
    label: 'Tarifa por unidad dentro de una ciudad',
    hint: 'Unidades del plano de la ciudad, no kilómetros. Va al rider.',
  },
  {
    key: 'interurbanRateBob',
    label: 'Tarifa por unidad entre ciudades',
    hint: 'Unidades del plano nacional, que tiene otra escala que el de una ciudad.',
  },
  {
    key: 'weatherFeeBob',
    label: 'Recargo por clima desfavorable',
    hint: 'Sólo se cobra a domicilio y sólo donde el clima está marcado como desfavorable.',
  },
  {
    key: 'minCareerPoints',
    label: 'Puntos de carrera mínimos',
    hint: 'Lo menos que puede dar un reclutamiento, sea normal o de hora pico.',
  },
];

@Component({
  selector: 'app-platform-fees',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [ArenaPageHead, ArenaSection, ArenaKeyValue, ArenaAlert, ArenaInput, ArenaButton],
  templateUrl: './fees.html',
})
export class PlatformFees {
  private readonly notices = inject(Notices);
  private readonly platform = inject(Platform);

  protected readonly knobs = KNOBS;

  private readonly typed = signal<Record<string, string>>({});

  protected readonly facts = computed<readonly ArenaKeyValueRow[]>(() => {
    const config = this.platform.config();

    return [
      { term: 'Comisión de Touno', value: porcentaje(config.commissionPct), numeric: true },
      { term: 'Envío base mínimo', value: bs(config.minDeliveryFeeBob), numeric: true },
      { term: 'Recargo por clima', value: bs(config.weatherFeeBob), numeric: true },
      {
        term: 'Puntos de carrera mínimos',
        value: config.minCareerPoints.toString(),
        numeric: true,
      },
    ];
  });

  protected valueOf(knob: Knob): string {
    return this.typed()[knob.key] ?? String(this.platform.config()[knob.key]);
  }

  protected ready(knob: Knob): boolean {
    const value = Number(this.valueOf(knob));

    return Number.isFinite(value) && value > 0;
  }

  protected onValue(knob: Knob, value: string): void {
    this.typed.update((held) => ({ ...held, [knob.key]: value }));
  }

  protected save(knob: Knob): void {
    if (!this.ready(knob)) {
      return;
    }

    this.platform.patch({ [knob.key]: Number(this.valueOf(knob)) });
    this.typed.update((held) => {
      const rest = { ...held };

      delete rest[knob.key];

      return rest;
    });
    this.notices.universalChanged(knob.label);
  }
}
