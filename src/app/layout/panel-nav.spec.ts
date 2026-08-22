import { PANELS, activeIdIn, destinationsFor, panelFor } from './panel-nav';

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
});
