import { TestBed } from '@angular/core/testing';
import { Businesses } from './businesses';
import { Chat } from './chat';
import { Riders } from './riders';

describe('Chat', () => {
  let chat: Chat;
  let businesses: Businesses;
  let riders: Riders;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    chat = TestBed.inject(Chat);
    businesses = TestBed.inject(Businesses);
    riders = TestBed.inject(Riders);
  });

  it('keeps exactly one thread per order code', () => {
    const codes = chat.all().map((one) => one.orderCode);

    expect(codes.length).toBeGreaterThan(0);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it('points every counterpart at a rider or a sucursal that exists', () => {
    for (const thread of chat.all()) {
      if (thread.counterpart.kind === 'rider') {
        expect(riders.byId(thread.counterpart.riderId ?? '')).toBeDefined();
        expect(thread.counterpart.branchId).toBeUndefined();
      } else {
        expect(businesses.branchById(thread.counterpart.branchId ?? '')).toBeDefined();
        expect(thread.counterpart.riderId).toBeUndefined();
      }

      expect(thread.counterpartName).not.toBe('');
    }
  });

  it('opens every thread with a system line, so nobody writes into the dark', () => {
    for (const thread of chat.all()) {
      expect(thread.messages.length).toBeGreaterThan(0);
      expect(thread.messages[0].author).toBe('sistema');
    }
  });

  it('keeps every message stamped in order and bound to its thread', () => {
    for (const thread of chat.all()) {
      const stamps = thread.messages.map((one) => one.at);

      expect([...stamps].sort()).toEqual(stamps);

      for (const message of thread.messages) {
        expect(message.threadId).toBe(thread.id);
        expect(message.body).not.toBe('');
      }
    }
  });

  it('carries a thread that changed custody twice, with a line for each relevo', () => {
    const relayed = chat.ofOrder('TO-2205');

    expect(chat.systemLinesOf(relayed?.id ?? '').length).toBeGreaterThanOrEqual(3);
    expect(relayed?.counterpart.kind).toBe('rider');
  });

  it('carries a thread that ended in the hands of a sucursal', () => {
    const collected = chat.ofOrder('TO-2206');

    expect(collected?.counterpart.kind).toBe('sucursal');
    expect(chat.counterpartAuthor(collected?.id ?? '')).toBe('sucursal');
  });

  it('rebinds the counterpart and explains it in the same breath', () => {
    const thread = chat.ofOrder('TO-2203');
    const before = chat.systemLinesOf(thread?.id ?? '').length;

    chat.handOver(
      thread?.id ?? '',
      { kind: 'rider', riderId: 'r-hugo', since: '2026-08-16T06:30:00' },
      'Hugo Barrientos',
      'La carga salió de Ale La Paz hacia Santa Cruz con Hugo Barrientos. Ahora hablas con él.',
    );

    const after = chat.byId(thread?.id ?? '');

    expect(after?.counterpart.kind).toBe('rider');
    expect(after?.counterpartName).toBe('Hugo Barrientos');
    expect(chat.systemLinesOf(thread?.id ?? '').length).toBe(before + 1);
    expect(chat.lastOf(thread?.id ?? '')?.author).toBe('sistema');
    expect(chat.lastOf(thread?.id ?? '')?.at).toBe('2026-08-16T06:30:00');
  });

  it('appends what the buyer writes, and ignores an empty line', () => {
    const thread = chat.ofOrder('TO-1043');
    const before = thread?.messages.length ?? 0;

    chat.send(thread?.id ?? '', '   ', 'comprador', 'Rosa Villca');

    expect(chat.byId(thread?.id ?? '')?.messages.length).toBe(before);

    chat.send(thread?.id ?? '', '  Ya bajo  ', 'comprador', 'Rosa Villca');

    expect(chat.byId(thread?.id ?? '')?.messages.length).toBe(before + 1);
    expect(chat.lastOf(thread?.id ?? '')?.body).toBe('Ya bajo');
  });

  it('leaves the other threads alone when one is written to', () => {
    const other = chat.ofOrder('TO-1044');
    const before = other?.messages.length;

    chat.send(chat.ofOrder('TO-1043')?.id ?? '', 'Gracias', 'comprador', 'Rosa Villca');

    expect(chat.ofOrder('TO-1044')?.messages.length).toBe(before);
  });
});
