import { PANELS, panelFor } from './panel-nav';

describe('panel navigation', () => {
  it('opens the buyer panel with the Feed', () => {
    const buyer = PANELS.find((panel) => panel.role === 'comprador');

    expect(buyer?.destinations[0].label).toBe('Feed');
    expect(buyer?.destinations[0].path).toBe('/feed');
  });

  it('draws the feed inside the buyer panel', () => {
    expect(panelFor('/feed')?.role).toBe('comprador');
  });

  it('keeps the buyer panel over the routes that are the buyer own', () => {
    expect(panelFor('/mis-pedidos')?.role).toBe('comprador');
    expect(panelFor('/carrito')?.role).toBe('comprador');
  });

  it('never lets a panel prefix match a longer public segment', () => {
    expect(panelFor('/restaurantes')).toBeUndefined();
  });
});
