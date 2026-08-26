import { TestBed } from '@angular/core/testing';
import { Agreements } from './agreements';
import { Callouts } from './callouts';
import { Staffing } from './staffing';

describe('Staffing', () => {
  let staffing: Staffing;
  let agreements: Agreements;
  let callouts: Callouts;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    staffing = TestBed.inject(Staffing);
    agreements = TestBed.inject(Agreements);
    callouts = TestBed.inject(Callouts);
  });

  it('staffs a sucursal with the riders it recruited and the free agents on its cupos', () => {
    const recruited = agreements.ridersOf('b-copacabana-miraflores').map((one) => one.id);
    const staffed = staffing.ridersOf('b-copacabana-miraflores').map((one) => one.id);

    for (const id of recruited) {
      expect(staffed).toContain(id);
    }

    expect(staffed).toContain('r-tania');
  });

  it('names how each of them is bound, because the two bonds are not paid the same', () => {
    expect(staffing.bondOf('r-tania', 'b-copacabana-miraflores')).toBe('agente-libre');
    expect(staffing.bondOf('r-marco', 'b-copacabana-miraflores')).toBe('normal');
  });

  it('answers nothing for a rider bound to that sucursal by neither', () => {
    expect(staffing.bondOf('r-diego', 'b-copacabana-miraflores')).toBeUndefined();
    expect(staffing.covers('r-diego', 'b-copacabana-miraflores')).toBe(false);
  });

  it('stops staffing a free agent the moment he retires from the llamado', () => {
    const claim = callouts.holdingOf('r-tania');

    expect(claim).toBeDefined();

    callouts.leave(claim!.id);

    expect(staffing.ridersOf('b-copacabana-miraflores').map((one) => one.id)).not.toContain(
      'r-tania',
    );
  });

  it('counts a free agent still on his way as not yet working there', () => {
    expect(callouts.holdingOf('r-ivan')?.state).toBe('en-camino');
    expect(staffing.ridersOf('b-illimani-san-miguel').map((one) => one.id)).not.toContain('r-ivan');
  });
});
