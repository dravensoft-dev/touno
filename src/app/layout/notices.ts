import { Injectable, inject } from '@angular/core';
import { ArenaToastQueue } from '@dravensoft/arena-angular';

@Injectable({ providedIn: 'root' })
export class Notices {
  private readonly queue = inject(ArenaToastQueue);

  addedToCart(product: string): void {
    this.queue.raise({
      title: 'Agregado al carrito',
      message: `${product} ya está en tu pedido.`,
      tone: 'success',
      dismissible: true,
    });
  }

  guiaCopied(guia: string): void {
    this.queue.raise({
      title: 'Guía copiada',
      message: `${guia} quedó en el portapapeles.`,
      tone: 'success',
      dismissible: true,
    });
  }

  guiaNotCopied(guia: string): void {
    this.queue.raise({
      title: 'No pudimos copiar la guía',
      message: `Cópiala a mano: ${guia}.`,
      tone: 'danger',
      dismissible: true,
    });
  }

  codeCopied(code: string): void {
    this.queue.raise({
      title: 'Código copiado',
      message: `${code} quedó en el portapapeles.`,
      tone: 'success',
      dismissible: true,
    });
  }

  codeNotCopied(code: string): void {
    this.queue.raise({
      title: 'No pudimos copiar el código',
      message: `Cópialo a mano: ${code}.`,
      tone: 'danger',
      dismissible: true,
    });
  }

  offerSent(driver: string): void {
    this.queue.raise({
      title: 'Oferta enviada',
      message: `${driver} la verá en su panel de conductor.`,
      tone: 'success',
      dismissible: true,
    });
  }

  offerAccepted(business: string): void {
    this.queue.raise({
      title: 'Oferta aceptada',
      message: `${business} ya puede asignarte carreras.`,
      tone: 'success',
      dismissible: true,
    });
  }

  offerRejected(business: string): void {
    this.queue.raise({
      title: 'Oferta rechazada',
      message: `Le avisamos a ${business} y sale de tus pendientes.`,
      tone: 'neutral',
      dismissible: true,
    });
  }

  replyPublished(): void {
    this.queue.raise({
      title: 'Respuesta publicada',
      message: 'La reseña ya la muestra debajo del comentario.',
      tone: 'success',
      dismissible: true,
    });
  }

  reportSent(): void {
    this.queue.raise({
      title: 'Reporte enviado',
      message: 'El equipo de Touno lo revisa y te escribe por el envío.',
      tone: 'neutral',
      dismissible: true,
    });
  }

  couponCreated(): void {
    this.queue.raise({
      title: 'Cupón creado',
      message: 'Ya se aplica a los pedidos que entren por tu carta.',
      tone: 'success',
      dismissible: true,
    });
  }
}
