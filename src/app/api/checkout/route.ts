// src/app/api/checkout/route.ts
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { DbOrder } from '@/models/Schemas';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

interface IncomingCartItem {
  name: string;
  parentGroup: string;
  price: number;
  quantity: number;
  weight: string;
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    
    const { customerName, customerPhone, cartItems, totalAmount } = body;

    if (!customerName || !customerPhone || !cartItems || !totalAmount) {
      return NextResponse.json({ success: false, error: 'Missing required parameters' }, { status: 400 });
    }

    const uniqueOrderId = `GH-${Date.now()}`;

    // Create the order in MongoDB
    await DbOrder.create({
      orderId: uniqueOrderId,
      customerName,
      customerPhone,
      items: cartItems,
      totalAmount,
      paymentStatus: 'PENDING'
    });

    // Prepare OPay API Production/Sandbox properties
    const opayPayload = {
      country: "NG",
      reference: uniqueOrderId,
      amount: {
        total: totalAmount.toString(),
        currency: "NGN"
      },
      returnUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/order-status?id=${uniqueOrderId}`,
      callbackUrl: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/opay/webhook`,
      product: {
        name: `GreenHouse Order ${uniqueOrderId}`,
        description: `Purchase by ${customerName}`
      },
      userInfo: {
        userName: customerName,
        userMobile: customerPhone
      }
    };

    const secretKey = process.env.OPAY_SECRET_KEY || 'auth_secret_key_fallback';
    const signature = crypto
      .createHmac('sha512', secretKey)
      .update(JSON.stringify(opayPayload))
      .digest('hex');

    // Send the initialization request directly to OPay
    const opayResponse = await fetch('https://sandboxapi.opaycheckout.com/api/v1/international/payment/create', {
      method: 'POST',
      headers: {
        'MerchantId': process.env.OPAY_MERCHANT_ID || '',
        'Authorization': `Bearer ${signature}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(opayPayload)
    });

    const opayData = await opayResponse.json();

    if (opayData && opayData.code === '00000' && opayData.data?.cashierUrl) {
      return NextResponse.json({
        success: true,
        cashierUrl: opayData.data.cashierUrl
      }, { status: 200 });
    } else {
      return NextResponse.json({
        success: false,
        error: opayData.message || 'OPay Gateway Reject'
      }, { status: 400 });
    }

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}