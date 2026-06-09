// src/lib/data.ts
import { Product } from '@/types';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Ghost Train Haze',
    brand: 'Boutique Botanicals',
    category: 'Flower',
    strain: 'Sativa',
    thc: 24.5,
    cbd: 0.1,
    price: 45.00,
    weight: '3.5g',
    image: 'https://images.unsplash.com/photo-1603909223429-69bb7101f420?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: '2',
    name: 'Granddaddy Purple',
    brand: 'Northern Lights Co.',
    category: 'Flower',
    strain: 'Indica',
    thc: 21.0,
    cbd: 0.5,
    price: 40.00,
    weight: '3.5g',
    image: 'https://images.unsplash.com/photo-1536617600307-865a13b9d2c1?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: '3',
    name: 'Live Resin Sugar - Wedding Cake',
    brand: 'Apex Extracts',
    category: 'Concentrates',
    strain: 'Hybrid',
    thc: 78.2,
    cbd: 1.2,
    price: 60.00,
    weight: '1g',
    image: 'https://images.unsplash.com/photo-1614727021118-2fe49652599f?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: '4',
    name: 'Sour Watermelon Gummies',
    brand: 'High Dose Labs',
    category: 'Edibles',
    strain: 'Hybrid',
    thc: 10.0, // per serving
    cbd: 0.0,
    price: 25.00,
    weight: '100mg',
    image: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&q=80&w=400'
  }
];