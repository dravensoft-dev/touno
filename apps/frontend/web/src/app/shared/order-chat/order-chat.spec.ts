import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatThread } from '../../domain/chat.model';
import { OrderChat } from './order-chat';

const THREAD: ChatThread = {
  id: 'th-1',
  orderCode: 'TO-1042',
  counterpart: { kind: 'rider', riderId: 'r-marco', since: '2026-08-15T13:02:00' },
  counterpartName: 'Marco Quispe',
  messages: [
    {
      id: 'm-1',
      threadId: 'th-1',
      author: 'sistema',
      authorName: 'Touno',
      body: 'Marco Quispe recogió tu pedido. Ahora hablas con él.',
      at: '2026-08-15T13:02:00',
    },
    {
      id: 'm-2',
      threadId: 'th-1',
      author: 'rider',
      authorName: 'Marco Quispe',
      body: 'Voy saliendo.',
      at: '2026-08-15T13:04:00',
    },
    {
      id: 'm-3',
      threadId: 'th-1',
      author: 'comprador',
      authorName: 'Rosa Villca',
      body: 'Portón verde.',
      at: '2026-08-15T13:06:00',
    },
  ],
};

function render(disabled = false): ComponentFixture<OrderChat> {
  TestBed.configureTestingModule({});

  const fixture = TestBed.createComponent(OrderChat);

  fixture.componentRef.setInput('thread', THREAD);
  fixture.componentRef.setInput('viewer', 'comprador');
  fixture.componentRef.setInput('disabled', disabled);
  fixture.detectChanges();

  return fixture;
}

describe('OrderChat', () => {
  it('draws one line per message', () => {
    const host: HTMLElement = render().nativeElement;

    expect(host.querySelectorAll('li').length).toBe(THREAD.messages.length);
  });

  it('draws a system line with no bubble and no author, so it reads as an explanation', () => {
    const host: HTMLElement = render().nativeElement;
    const note = host.querySelector('.chat__note');

    expect(note?.textContent).toContain('Ahora hablas con él');
    expect(note?.querySelector('.chat__bubble')).toBeNull();
    expect(note?.querySelector('.chat__author')).toBeNull();
  });

  it('puts the viewer own words on one side and the counterpart on the other', () => {
    const host: HTMLElement = render().nativeElement;
    const mine = host.querySelectorAll('.chat__line--mine');

    expect(mine.length).toBe(1);
    expect(mine[0].textContent).toContain('Portón verde');
  });

  it('stamps every message with its hour', () => {
    const host: HTMLElement = render().nativeElement;

    expect(host.textContent).toContain('13:04');
    expect(host.textContent).toContain('13:06');
  });

  it('names the counterpart on the composer, so the buyer knows who reads it', () => {
    const host: HTMLElement = render().nativeElement;

    expect(host.textContent).toContain('Marco Quispe');
    expect(host.querySelector('arena-textarea')).not.toBeNull();
  });

  it('draws no composer when the conversation is closed', () => {
    const host: HTMLElement = render(true).nativeElement;

    expect(host.querySelector('arena-textarea')).toBeNull();
  });

  it('reports what was typed once, and ignores an empty line', () => {
    const fixture = render();
    const sent: string[] = [];

    fixture.componentInstance.send.subscribe((body) => sent.push(body));

    const button: HTMLElement | null = fixture.nativeElement.querySelector('arena-button button');

    button?.click();

    expect(sent).toEqual([]);

    const field: HTMLTextAreaElement = fixture.nativeElement.querySelector('textarea');

    field.value = '  Ya bajo  ';
    field.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    button?.click();

    expect(sent).toEqual(['Ya bajo']);
  });
});
