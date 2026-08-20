import { Injectable, inject } from '@angular/core';
import { ArenaToastQueue } from '@dravensoft/arena-angular';

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

  codeMismatch(): void {
    this.toasts.raise({
      title: 'Ese código no es de este pedido',
      message: 'Pide al comprador que abra su pedido en la aplicación.',
      tone: 'danger',
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

  availabilityChanged(name: string, available: boolean): void {
    this.toasts.raise({
      title: available ? 'Disponible otra vez' : 'Marcado como agotado',
      message: `${name} · sólo en tu sucursal`,
      tone: 'success',
    });
  }
}
