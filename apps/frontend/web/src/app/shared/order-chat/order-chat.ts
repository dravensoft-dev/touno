import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { ArenaButton, ArenaTextarea } from '@dravensoft/arena-angular';
import { ChatAuthor, ChatMessage, ChatThread } from '../../domain/chat.model';
import { hhmm } from '../../domain/format';

interface Line {
  readonly message: ChatMessage;
  readonly system: boolean;
  readonly mine: boolean;
  readonly at: string;
}

@Component({
  selector: 'app-order-chat',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [ArenaButton, ArenaTextarea],
  templateUrl: './order-chat.html',
  styleUrl: './order-chat.css',
})
export class OrderChat {
  readonly thread = input.required<ChatThread>();
  readonly viewer = input.required<ChatAuthor>();
  readonly disabled = input(false);
  readonly send = output<string>();

  protected readonly draft = signal('');

  protected readonly lines = computed<readonly Line[]>(() =>
    this.thread().messages.map((message) => ({
      message,
      system: message.author === 'sistema',
      mine: message.author === this.viewer(),
      at: hhmm(message.at),
    })),
  );

  protected onDraft(value: string): void {
    this.draft.set(value);
  }

  protected submit(): void {
    const body = this.draft().trim();

    if (body === '') {
      return;
    }

    this.send.emit(body);
    this.draft.set('');
  }
}
