import { Injectable, inject } from '@angular/core';
import { ArenaToastQueue } from '@dravensoft/arena-angular';
import { PayoutMethod, methodLabel } from '../domain/payments.model';

@Injectable({ providedIn: 'root' })
export class Notices {
  private readonly toasts = inject(ArenaToastQueue);

  addedToCart(name: string): void {
    this.toasts.raise({ title: 'Agregado al carrito', message: name, tone: 'success' });
  }

  codeCopied(code: string): void {
    this.toasts.raise({ title: 'Código copiado', message: code, tone: 'success' });
  }

  codeNotCopied(): void {
    this.toasts.raise({
      title: 'No pudimos copiar el código',
      message: 'Cópialo a mano de la pantalla.',
      tone: 'danger',
    });
  }

  orderPlaced(code: string): void {
    this.toasts.raise({
      title: 'Pedido confirmado',
      message: `Guarda tu código ${code}. Es lo que te escanean al recibir.`,
      tone: 'success',
    });
  }

  riderAssigned(name: string): void {
    this.toasts.raise({ title: 'Rider asignado', message: name, tone: 'success' });
  }

  orderScanned(code: string): void {
    this.toasts.raise({ title: 'Entrega confirmada', message: code, tone: 'success' });
  }

  runSpent(left: number): void {
    this.toasts.raise({
      title: 'Una carrera menos',
      message: `Te quedan ${left} en ese reclutamiento.`,
      tone: 'success',
    });
  }

  recruitmentFulfilled(): void {
    this.toasts.raise({
      title: 'Reclutamiento cumplido',
      message: 'Gastaste la última carrera. Quedas libre para un reclutamiento de hora pico.',
      tone: 'success',
    });
  }

  loadReceived(): void {
    this.toasts.raise({
      title: 'Carga recibida',
      message: 'La sucursal de destino ya tiene los pedidos, y sus compradores fueron avisados.',
      tone: 'success',
    });
  }

  codeMismatch(): void {
    this.toasts.raise({
      title: 'Ese código no es de este pedido',
      message: 'Pide al comprador que abra su pedido en la aplicación.',
      tone: 'danger',
    });
  }

  onTheWay(branchName: string): void {
    this.toasts.raise({
      title: 'Avisamos que vas en camino',
      message: `${branchName} ya sabe que tiene un agente libre llegando.`,
      tone: 'success',
    });
  }

  leftTheCallout(branchName: string): void {
    this.toasts.raise({
      title: 'Dejaste de ser agente libre',
      message: `${branchName} ya sabe que debe buscar a otro. Tu modo de agente libre sigue activo.`,
      tone: 'neutral',
    });
  }

  agreementSent(): void {
    this.toasts.raise({
      title: 'Propuesta enviada',
      message: 'Queda esperando la respuesta de la otra parte.',
      tone: 'success',
    });
  }

  agreementAccepted(): void {
    this.toasts.raise({
      title: 'Acuerdo aceptado',
      message: 'Ya pueden trabajar juntos.',
      tone: 'success',
    });
  }

  agreementRejected(): void {
    this.toasts.raise({
      title: 'Acuerdo rechazado',
      message: 'La otra parte fue avisada.',
      tone: 'neutral',
    });
  }

  messageSent(): void {
    this.toasts.raise({
      title: 'Mensaje enviado',
      message: 'Le llega al instante.',
      tone: 'success',
    });
  }

  loadDeparted(): void {
    this.toasts.raise({
      title: 'La carga salió',
      message: 'Los compradores ya ven el camión en su mapa.',
      tone: 'success',
    });
  }

  priceSaved(name: string): void {
    this.toasts.raise({
      title: 'Precio guardado',
      message: `${name} · tus sucursales ya lo cobran así`,
      tone: 'success',
    });
  }

  universalChanged(label: string): void {
    this.toasts.raise({
      title: 'Valor universal actualizado',
      message: `${label} rige desde ahora para toda la red.`,
      tone: 'success',
    });
  }

  weatherChanged(city: string, adverse: boolean): void {
    if (adverse) {
      this.toasts.raise({
        title: 'Clima desfavorable',
        message: `${city} paga el recargo en cada entrega a domicilio.`,
        tone: 'gold',
      });

      return;
    }

    this.toasts.raise({
      title: 'Clima normal',
      message: `${city} deja de pagar el recargo.`,
      tone: 'success',
    });
  }

  feeRaised(): void {
    this.toasts.raise({
      title: 'Tarifa actualizada',
      message: 'Rige desde el próximo pedido de tus sucursales.',
      tone: 'success',
    });
  }

  cardSaved(): void {
    this.toasts.raise({
      title: 'Tarjeta registrada',
      message: 'Guardamos la marca y los últimos cuatro dígitos, nada más.',
      tone: 'success',
    });
  }

  cardRemoved(): void {
    this.toasts.raise({
      title: 'Tarjeta quitada',
      message: 'Vuelves a cobrar por depósito automático.',
      tone: 'neutral',
    });
  }

  payoutMethodChanged(method: PayoutMethod): void {
    this.toasts.raise({
      title: 'Forma de cobro actualizada',
      message: methodLabel(method),
      tone: 'success',
    });
  }

  availabilityChanged(name: string, available: boolean): void {
    this.toasts.raise({
      title: available ? 'Disponible otra vez' : 'Marcado como agotado',
      message: `${name} · sólo en tu sucursal`,
      tone: 'success',
    });
  }
}
