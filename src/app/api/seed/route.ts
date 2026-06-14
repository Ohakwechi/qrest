// src/app/api/seed/route.ts
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { DbProduct } from '@/models/Schemas';

export const dynamic = 'force-dynamic';

const COMPLETE_SEED_DATA = [
  {
    name: 'GreenHouse Strains',
    brand: 'GreenHouse Farms',
    options: [
      { 
        label: 'Cana', 
        price: 3000.00, 
        category: 'Flower', 
        strain: 'Cana Hybrid', 
        thc: 24.5, 
        cbd: 0.1, 
        image: '/images/flower.jpeg',
        weight: '3.5g'
      },
      { 
        label: 'Scottish', 
        price: 4500.00, 
        category: 'Flower', 
        strain: 'Scottish Loud', 
        thc: 22.0, 
        cbd: 0.4, 
        image: '/images/flower.jpeg',
        weight: '3.5g'
      }
    ]
  },
  {
    name: 'Pre-Roll Options',
    brand: 'GreenHouse Farms',
    options: [
      { 
        label: 'Cana Cone', 
        price: 9000.00, 
        category: 'Cones', 
        strain: 'Cana Pre-Roll', 
        thc: 21.0, 
        cbd: 0.5, 
        image: '/images/cones.jpeg',
        weight: '3.5g'
      },
      { 
        label: 'Scottish Cone', 
        price: 10500.00, 
        category: 'Cones', 
        strain: 'Scottish Pre-Roll', 
        thc: 20.0, 
        cbd: 0.2, 
        image: '/images/cones.jpeg',
        weight: '3.5g'
      }
    ]
  },
  {
    name: 'Infused Menu',
    brand: 'GreenHouse Labs',
    options: [
      { 
        label: 'Gummies', 
        price: 5000.00, 
        category: 'Edibles', 
        strain: 'Fruit Gummies', 
        thc: 10.0, 
        cbd: 2.0, 
        image: '/images/edibles.jpeg',
        weight: '10 Pack'
      },
      { 
        label: 'Brownies', 
        price: 6500.00, 
        category: 'Edibles', 
        strain: 'Fudge Brownie', 
        thc: 25.0, 
        cbd: 0.0, 
        image: '/images/edibles.jpeg',
        weight: 'Single Serving'
      }
    ]
  },
  {
    name: 'Rolling Tools',
    brand: 'GreenHouse Labs',
    options: [
      { 
        label: 'Rizla', 
        price: 2000.00, 
        category: 'Accessories', 
        strain: 'Skins', 
        thc: 0, 
        cbd: 0, 
        image: '/images/accessories.jpg',
        weight: 'King Size'
      },
      { 
        label: 'Grinder', 
        price: 7500.00, 
        category: 'Accessories', 
        strain: 'Hardware', 
        thc: 0, 
        cbd: 0, 
        image: '/images/accessories.jpg',
        weight: '4-Piece Zinc'
      }
    ]
  }
];

export async function GET() {
  try {
    await connectToDatabase();
    
    // Safely purge collection instances across cluster connections
    await DbProduct.deleteMany({});
    
    // Write new items cleanly to collection
    const insertedProducts = await DbProduct.insertMany(COMPLETE_SEED_DATA);
    
    return NextResponse.json({
      success: true,
      message: 'Database successfully seeded with absolute toggles data format!',
      count: insertedProducts.length
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}