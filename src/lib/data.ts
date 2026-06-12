// src/lib/data.ts
import { Product } from '@/types';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Cana + Scottish',
    brand: 'GreenHouse Farms',
    category: 'Flower',
    strain: 'flower',
    thc: 24.5,
    cbd: 0.1,
    price: 3000.00,
    weight: '3.5g',
    image: '/images/flower.jpeg'
  },
  {
    id: '2',
    name: 'Cana + Scottish',
    brand: 'GreenHouse Farms',
    category: 'Cones',
    strain: 'Cones',
    thc: 21.0,
    cbd: 0.5,
    price: 9000.00,
    weight: '3.5g',
    image: '/images/cones.jpeg'
  },
  {
    id: '3',
    name: 'Gummies + Brownies',
    brand: 'GreenHouse Labs',
    category: 'Edibles',
    strain: 'Edibles',
    thc: 78.2,
    cbd: 1.2,
    price: 5000.00,
    weight: '1g',
    image: '/images/edibles.jpeg'
  },
  {
    id: '4',
    name: 'Rizla + Grinders',
    brand: 'GreenHouse Labs',
    category: 'Accessories',
    strain: 'Accessories',
    thc: 10.0, // per serving
    cbd: 0.0,
    price: 2000.00,
    weight: '100mg',
    image: '/images/accessories.jpg'
  }
];