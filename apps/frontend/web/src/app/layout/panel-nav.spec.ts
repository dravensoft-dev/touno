import {
  BAR_SLOTS,
  PANELS,
  activeIdIn,
  barDestinations,
  destinationsFor,
  moreDestinations,
  panelFor,
  panelOf,
  railEntries,
} from './panel-nav';
import { PROFILES } from '../domain/session';

describe('panelFor', () => {
  it('finds the panel of each role by its prefix', () => {
    expect(panelFor('/empresa/sucursales')?.role).toBe('gerente-empresa');
    expect(panelFor('/sucursal/pedidos')?.role).toBe('gerente-sucursal');
    expect(panelFor('/rider/turno')?.role).toBe('rider');
    expect(panelFor('/mis-pedidos')?.role).toBe('comprador');
    expect(panelFor('/feed')?.role).toBe('comprador');
    expect(panelFor('/carrito')?.role).toBe('comprador');
  });

  it('matches on a segment boundary, so a public listing stays public', () => {
    expect(panelFor('/restaurantes')).toBeUndefined();
    expect(panelFor('/restaurantes/pollos-copacabana')).toBeUndefined();
    expect(panelFor('/restaurantes/pollos-copacabana/miraflores')).toBeUndefined();
    expect(panelFor('/tiendas')).toBeUndefined();
  });

  it('keeps the rider panel away from the public riders page', () => {
    expect(panelFor('/riders')).toBeUndefined();
    expect(panelFor('/rider')?.role).toBe('rider');
    expect(panelFor('/rider/encargos/to-1043')?.role).toBe('rider');
  });

  it('leaves the landing and the sign-in with no panel at all', () => {
    expect(panelFor('/')).toBeUndefined();
    expect(panelFor('/ingresar')).toBeUndefined();
  });

  it('ignores the query string', () => {
    expect(panelFor('/sucursal/pedidos?estado=nuevo')?.role).toBe('gerente-sucursal');
  });
});

describe('destinationsFor', () => {
  const branch = PANELS.find((one) => one.role === 'gerente-sucursal');

  it('shows a restaurant its carta and never the catálogo', () => {
    const ids = destinationsFor(branch!, 'restaurante').map((one) => one.id);

    expect(ids).toContain('carta');
    expect(ids).not.toContain('catalogo');
  });

  it('shows an importadora its catálogo and never the carta', () => {
    const ids = destinationsFor(branch!, 'importadora').map((one) => one.id);

    expect(ids).toContain('catalogo');
    expect(ids).not.toContain('carta');
  });

  it('drops both when nobody is signed in, which is what the prerender writes', () => {
    const ids = destinationsFor(branch!, undefined).map((one) => one.id);

    expect(ids).not.toContain('carta');
    expect(ids).not.toContain('catalogo');
    expect(ids).toContain('pedidos');
  });

  it('leaves a panel with no vertical of its own untouched', () => {
    const rider = PANELS.find((one) => one.role === 'rider');

    expect(destinationsFor(rider!, undefined).length).toBe(rider?.destinations.length);
  });
});

describe('activeIdIn', () => {
  it('lights the deepest destination that matches', () => {
    const branch = PANELS.find((one) => one.role === 'gerente-sucursal');

    expect(activeIdIn(branch!, '/sucursal/pedidos')).toBe('pedidos');
    expect(activeIdIn(branch!, '/sucursal/pedidos/to-1042')).toBe('pedidos');
    expect(activeIdIn(branch!, '/sucursal/entregas')).toBe('entregas');
  });

  it('answers an id and never a path', () => {
    const rider = PANELS.find((one) => one.role === 'rider');

    expect(activeIdIn(rider!, '/rider/encargos/to-1043')).toBe('encargos');
    expect(activeIdIn(rider!, '/rider/nada')).toBeUndefined();
  });

  it('opens the Touno panel on its own prefix and never swallows a neighbour', () => {
    expect(panelFor('/plataforma/tarifas')?.role).toBe('operador');
    expect(panelFor('/plataforma')?.role).toBe('operador');
    expect(panelFor('/plataformas')).toBeUndefined();
  });

  it('keeps the operador rail whole, because he answers for no vertical', () => {
    const panel = PANELS.find((one) => one.role === 'operador');

    expect(panel).toBeDefined();
    expect(destinationsFor(panel!, undefined).length).toBe(panel?.destinations.length);
    expect(destinationsFor(panel!, 'restaurante').length).toBe(panel?.destinations.length);
  });

  it('gives every panel a Manual destination', () => {
    for (const panel of PANELS) {
      const manual = panel.destinations.find((one) => one.id === 'manual');

      expect(manual).toBeDefined();
      expect(manual?.path).toBe(`/manual/${panel.role}`);
    }
  });

  it('leaves the panel when the Manual opens, because the manual is public', () => {
    for (const panel of PANELS) {
      expect(panelFor(`/manual/${panel.role}`)).toBeUndefined();
    }

    expect(panelFor('/manual')).toBeUndefined();
  });
});

describe('the rail', () => {
  it('never sends a destination to the landing, which is the public door and has no rail', () => {
    for (const panel of PANELS) {
      for (const destination of panel.destinations) {
        expect(destination.path).not.toBe('/');
      }
    }
  });

  it('gives the comprador his shop at the feed and nothing that leaves the panel', () => {
    const buyer = PANELS.find((one) => one.role === 'comprador');

    expect(buyer!.destinations.map((one) => one.id)).toEqual([
      'tienda',
      'carrito',
      'mis-pedidos',
      'manual',
    ]);
    expect(buyer!.destinations[0].path).toBe('/feed');
  });
});

describe('panelOf', () => {
  it('answers the panel of every role, which is what a signed-in reader carries around', () => {
    expect(panelOf('comprador')?.prefix).toBe('/mis-pedidos');
    expect(panelOf('rider')?.prefix).toBe('/rider');
    expect(panelOf('gerente-empresa')?.prefix).toBe('/empresa');
    expect(panelOf('gerente-sucursal')?.prefix).toBe('/sucursal');
    expect(panelOf('operador')?.prefix).toBe('/plataforma');
  });

  it('answers every role a profile actually holds, so no count has to be written down', () => {
    expect(PROFILES.length).toBeGreaterThan(0);

    for (const profile of PROFILES) {
      expect(panelOf(profile.role), `${profile.id} has a role with no panel`).toBeDefined();
    }
  });

  it('is answered by at least one profile per panel, which is what makes every panel walkable', () => {
    for (const panel of PANELS) {
      const holders = PROFILES.filter((one) => panelOf(one.role)?.prefix === panel.prefix);

      expect(holders.length, `${panel.prefix} has no profile that opens it`).toBeGreaterThan(0);
    }
  });
});

describe('the bottom bar', () => {
  const verticals = [undefined, 'restaurante', 'importadora'] as const;

  it('holds three destinations, because the fourth column belongs to Más', () => {
    for (const panel of PANELS) {
      for (const type of verticals) {
        expect(barDestinations(destinationsFor(panel, type)).length).toBeLessThanOrEqual(BAR_SLOTS);
      }
    }
  });

  it('sends everything the bar cannot hold to Más, in rail order and losing nothing', () => {
    for (const panel of PANELS) {
      for (const type of verticals) {
        const all = destinationsFor(panel, type);

        expect([...barDestinations(all), ...moreDestinations(all)]).toEqual(all);
      }
    }
  });

  it('puts every Manual within reach of a phone, which no bottom bar ever did', () => {
    for (const panel of PANELS) {
      for (const type of verticals) {
        const ids = moreDestinations(destinationsFor(panel, type)).map((one) => one.id);

        expect(ids).toContain('manual');
      }
    }
  });

  it('leaves Más empty for nobody, because it also carries the tema and the salida', () => {
    for (const panel of PANELS) {
      for (const type of verticals) {
        expect(moreDestinations(destinationsFor(panel, type)).length).toBeGreaterThan(0);
      }
    }
  });

  it('never splits a group between the bottom bar and Más', () => {
    for (const panel of PANELS) {
      for (const type of verticals) {
        const all = destinationsFor(panel, type);
        const inBar = new Set(barDestinations(all).map((one) => one.group));

        for (const destination of moreDestinations(all)) {
          expect(inBar.has(destination.group)).toBe(destination.group === undefined);
        }
      }
    }
  });

  it('folds a group into one rail entry and leaves every other destination alone', () => {
    for (const panel of PANELS) {
      for (const type of verticals) {
        const all = destinationsFor(panel, type);
        const entries = railEntries(all);
        const flat = entries.flatMap((one) =>
          one.group ? [...one.destinations!] : [one.destination!],
        );

        expect(flat).toEqual(all);
        expect(new Set(entries.map((one) => one.key)).size).toBe(entries.length);
      }
    }
  });

  it('gives the two panels that sell promotions a group and the others none', () => {
    const grouped = PANELS.filter((panel) =>
      panel.destinations.some((one) => one.group === 'promociones'),
    ).map((panel) => panel.role);

    expect(grouped.sort()).toEqual(['gerente-empresa', 'gerente-sucursal']);
  });
});
