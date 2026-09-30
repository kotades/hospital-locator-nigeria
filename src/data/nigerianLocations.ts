import { NigerianCityLocation } from '@/types';

export const NIGERIAN_LOCATIONS: NigerianCityLocation[] = [
  {
    id: 'delta-asaba',
    name: 'Asaba - Delta State Capital',
    city: 'Asaba',
    state: 'Delta',
    lat: 6.1936,
    lng: 6.7355,
    description: 'Capital of Delta State — South-South Nigeria administrative hub'
  },
  {
    id: 'delta-warri',
    name: 'Warri - Delta State (Commercial Hub)',
    city: 'Warri',
    state: 'Delta',
    lat: 5.5167,
    lng: 5.7500,
    description: 'Major commercial and oil hub of Delta State'
  },
  {
    id: 'lagos-ikeja',
    name: 'Lagos - Ikeja (Capital / Mainland)',
    city: 'Ikeja',
    state: 'Lagos',
    lat: 6.6018,
    lng: 3.3515,
    description: 'Commercial & administrative capital of Lagos State'
  },
  {
    id: 'lagos-vi',
    name: 'Lagos - Victoria Island (Financial Hub)',
    city: 'Victoria Island',
    state: 'Lagos',
    lat: 6.4281,
    lng: 3.4219,
    description: 'Island business district & coastal medical corridor'
  },
  {
    id: 'abuja-central',
    name: 'Abuja - Central Area (FCT)',
    city: 'Abuja',
    state: 'Federal Capital Territory',
    lat: 9.0579,
    lng: 7.4951,
    description: 'Federal Capital Territory central business district'
  },
  {
    id: 'ibadan-ui',
    name: 'Ibadan - UI / Ring Road',
    city: 'Ibadan',
    state: 'Oyo',
    lat: 7.3775,
    lng: 3.9470,
    description: 'Academic and medical center of Oyo State'
  },
  {
    id: 'portharcourt-gra',
    name: 'Port Harcourt - Old GRA',
    city: 'Port Harcourt',
    state: 'Rivers',
    lat: 4.8156,
    lng: 7.0498,
    description: 'Niger Delta commercial and energy center'
  },
  {
    id: 'kano-city',
    name: 'Kano - City Center',
    city: 'Kano',
    state: 'Kano',
    lat: 12.0022,
    lng: 8.5920,
    description: 'Northern commercial hub and historic trading capital'
  }
];

export const DEFAULT_LOCATION: NigerianCityLocation = NIGERIAN_LOCATIONS[0];
