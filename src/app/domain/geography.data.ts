import { City } from './geography.model';

export const CITIES: readonly City[] = [
  {
    id: 'la-paz',
    slug: 'la-paz',
    name: 'La Paz',
    zones: ['Miraflores', 'Sopocachi', 'San Miguel', 'Obrajes', 'Centro'],
  },
  {
    id: 'santa-cruz',
    slug: 'santa-cruz',
    name: 'Santa Cruz',
    zones: ['Equipetrol', 'Norte', 'Plan Tres Mil', 'Centro'],
  },
  {
    id: 'cochabamba',
    slug: 'cochabamba',
    name: 'Cochabamba',
    zones: ['Cala Cala', 'Queru Queru', 'Centro', 'Sacaba'],
  },
  {
    id: 'oruro',
    slug: 'oruro',
    name: 'Oruro',
    zones: ['Centro', 'Sud'],
  },
  {
    id: 'sucre',
    slug: 'sucre',
    name: 'Sucre',
    zones: ['Centro', 'Recoleta'],
  },
];
