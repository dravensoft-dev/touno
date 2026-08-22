import { City } from './geography.model';

export const CITIES: readonly City[] = [
  {
    id: 'la-paz',
    slug: 'la-paz',
    name: 'La Paz',
    zones: [
      { name: 'Miraflores', point: { x: 36, y: 40 } },
      { name: 'Sopocachi', point: { x: 28, y: 53 } },
      { name: 'San Miguel', point: { x: 20, y: 70 } },
      { name: 'Obrajes', point: { x: 24, y: 62 } },
      { name: 'Centro', point: { x: 31, y: 33 } },
    ],
    point: { x: 22, y: 26 },
    weather: 'normal',
  },
  {
    id: 'santa-cruz',
    slug: 'santa-cruz',
    name: 'Santa Cruz',
    zones: [
      { name: 'Equipetrol', point: { x: 53, y: 45 } },
      { name: 'Norte', point: { x: 60, y: 25 } },
      { name: 'Plan Tres Mil', point: { x: 65, y: 73 } },
      { name: 'Centro', point: { x: 46, y: 56 } },
    ],
    point: { x: 74, y: 47 },
    weather: 'normal',
  },
  {
    id: 'cochabamba',
    slug: 'cochabamba',
    name: 'Cochabamba',
    zones: [
      { name: 'Cala Cala', point: { x: 47, y: 31 } },
      { name: 'Queru Queru', point: { x: 50, y: 38 } },
      { name: 'Centro', point: { x: 41, y: 50 } },
      { name: 'Sacaba', point: { x: 62, y: 55 } },
    ],
    point: { x: 45, y: 44 },
    weather: 'adverso',
  },
  {
    id: 'oruro',
    slug: 'oruro',
    name: 'Oruro',
    zones: [
      { name: 'Centro', point: { x: 51, y: 38 } },
      { name: 'Sud', point: { x: 54, y: 50 } },
    ],
    point: { x: 30, y: 45 },
    weather: 'normal',
  },
  {
    id: 'sucre',
    slug: 'sucre',
    name: 'Sucre',
    zones: [
      { name: 'Centro', point: { x: 47, y: 48 } },
      { name: 'Recoleta', point: { x: 56, y: 64 } },
    ],
    point: { x: 52, y: 62 },
    weather: 'normal',
  },
];
