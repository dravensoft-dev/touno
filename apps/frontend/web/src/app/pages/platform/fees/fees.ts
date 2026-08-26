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
import { WorkMode } from '../../../domain/agreements.model';
import { bs, porcentaje } from '../../../domain/format';
import { Notices } from '../../../layout/notices';

interface Knob {
  readonly key: keyof PlatformConfig;
  readonly label: string;
  readonly hint: string;
  readonly mode?: WorkMode;
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
    key: 'riderBaseBob',
    mode: 'agente-libre',
    label: 'Fija mínima de un agente libre',
    hint: 'Lo menos que puede cobrar por carrera quien trabaja suelto. Es la más baja de las tres, y una sucursal puede subirla en su llamado.',
  },
  {
    key: 'riderBaseBob',
    mode: 'normal',
    label: 'Fija mínima de un reclutamiento normal',
    hint: 'Lo menos que puede pagar por carrera quien recluta en normal. Va por encima de la del agente libre.',
  },
  {
    key: 'riderBaseBob',
    mode: 'hora-pico',
    label: 'Fija mínima de un reclutamiento de hora pico',
    hint: 'La más alta de las tres, porque es la que más compromete al rider. La distancia y el clima se suman aparte.',
  },
  {
    key: 'minReputationPct',
    label: 'Reputación mínima',
    hint: 'El cumplimiento que hace falta para reclutar y para tomar hora pico. Se lee cada vez que alguien pregunta, así que subirlo bloquea al instante a quien quede debajo.',
  },
  {
    key: 'minRuns',
    label: 'Carreras mínimas',
    hint: 'Lo menos que puede comprometer un reclutamiento, sea normal o de hora pico.',
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

  protected readonly refused = signal<string | undefined>(undefined);

  protected readonly facts = computed<readonly ArenaKeyValueRow[]>(() => {
    const config = this.platform.config();

    return [
      { term: 'Comisión de Touno', value: porcentaje(config.commissionPct), numeric: true },
      { term: 'Envío base mínimo', value: bs(config.minDeliveryFeeBob), numeric: true },
      { term: 'Recargo por clima', value: bs(config.weatherFeeBob), numeric: true },
      {
        term: 'Reputación mínima',
        value: porcentaje(config.minReputationPct),
        numeric: true,
      },
      {
        term: 'Carreras mínimas',
        value: config.minRuns.toString(),
        numeric: true,
      },
    ];
  });

  protected valueOf(knob: Knob): string {
    return this.typed()[keyOf(knob)] ?? String(this.storedOf(knob));
  }

  protected ready(knob: Knob): boolean {
    const value = Number(this.valueOf(knob));

    return Number.isFinite(value) && value > 0;
  }

  protected onValue(knob: Knob, value: string): void {
    this.typed.update((held) => ({ ...held, [keyOf(knob)]: value }));
  }

  protected save(knob: Knob): void {
    if (!this.ready(knob)) {
      return;
    }

    const mode = knob.mode;
    const value = Number(this.valueOf(knob));

    try {
      this.platform.patch(
        mode
          ? { riderBaseBob: { ...this.platform.riderBaseBob(), [mode]: value } }
          : { [knob.key]: value },
      );
    } catch (refusal) {
      this.refused.set(refusal instanceof Error ? refusal.message : '');

      return;
    }

    this.refused.set(undefined);
    this.typed.update((held) => {
      const rest = { ...held };

      delete rest[keyOf(knob)];

      return rest;
    });
    this.notices.universalChanged(knob.label);
  }

  private storedOf(knob: Knob): number {
    const config = this.platform.config();

    return knob.mode ? config.riderBaseBob[knob.mode] : (config[knob.key] as number);
  }
}

function keyOf(knob: Knob): string {
  return knob.mode ? `${knob.key}:${knob.mode}` : knob.key;
}
