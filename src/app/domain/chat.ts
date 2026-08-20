import { Injectable, signal } from '@angular/core';
import { NOW } from './clock';
import { ChatMessage, ChatThread, Custody, authorOf } from './chat.model';
import { THREADS } from './chat.data';

@Injectable({ providedIn: 'root' })
export class Chat {
  private readonly threadList = signal<readonly ChatThread[]>(THREADS);

  private sequence = 0;

  readonly all = this.threadList.asReadonly();

  byId(id: string): ChatThread | undefined {
    return this.all().find((one) => one.id === id);
  }

  ofOrder(code: string): ChatThread | undefined {
    return this.all().find((one) => one.orderCode === code);
  }

  systemLinesOf(id: string): readonly ChatMessage[] {
    return this.byId(id)?.messages.filter((one) => one.author === 'sistema') ?? [];
  }

  lastOf(id: string): ChatMessage | undefined {
    const messages = this.byId(id)?.messages ?? [];

    return messages[messages.length - 1];
  }

  send(id: string, body: string, from: 'comprador' | 'rider' | 'sucursal', name: string): void {
    const text = body.trim();

    if (text === '') {
      return;
    }

    this.append(id, { author: from, authorName: name, body: text });
  }

  handOver(id: string, counterpart: Custody, counterpartName: string, reason: string): void {
    this.threadList.update((list) =>
      list.map((one) =>
        one.id === id
          ? {
              ...one,
              counterpart,
              counterpartName,
              messages: [
                ...one.messages,
                this.messageOf(id, 'sistema', 'Touno', reason, counterpart.since),
              ],
            }
          : one,
      ),
    );
  }

  note(id: string, body: string): void {
    this.append(id, { author: 'sistema', authorName: 'Touno', body });
  }

  counterpartAuthor(id: string): 'rider' | 'sucursal' | undefined {
    const thread = this.byId(id);

    return thread && authorOf(thread.counterpart.kind);
  }

  private append(
    id: string,
    draft: { author: ChatMessage['author']; authorName: string; body: string },
  ): void {
    this.threadList.update((list) =>
      list.map((one) =>
        one.id === id
          ? {
              ...one,
              messages: [
                ...one.messages,
                this.messageOf(id, draft.author, draft.authorName, draft.body, NOW),
              ],
            }
          : one,
      ),
    );
  }

  private messageOf(
    threadId: string,
    author: ChatMessage['author'],
    authorName: string,
    body: string,
    at: string,
  ): ChatMessage {
    this.sequence += 1;

    return { id: `m-nuevo-${this.sequence}`, threadId, author, authorName, body, at };
  }
}
