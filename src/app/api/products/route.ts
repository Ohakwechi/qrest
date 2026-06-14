// src/app/api/products/route.ts
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { DbProduct } from '@/models/Schemas';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    await connectToDatabase();
    const products = await DbProduct.find({}).lean();
    
    return NextResponse.json(products, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0, must-revalidate',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}