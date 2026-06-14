// src/app/api/opay/webhook/route.ts
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { DbOrder } from '@/models/Schemas';
import twilio from 'twilio';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    
    // OPay returns status indicators inside payload structures
    const { reference, status } = body;

    const order = await DbOrder.findOne({ orderId: reference });
    if (!order) {
      return NextResponse.json({ code: "0404", message: "Order context missing" }, { status: 404 });
    }

    if (status === 'SUCCESSFUL' || status === 'SUCCESS') {
      order.paymentStatus = 'PAID';
      await order.save();

      // Fire Twilio WhatsApp Message Pipeline
      const accountSid = process.env.TWILIO_ACCOUNT_SID || '';
      const authToken = process.env.TWILIO_AUTH_TOKEN || '';
      const twilioClient = twilio(accountSid, authToken);

      // Clean the incoming customer phone number string for WhatsApp requirements
      let formattedPhone = order.customerPhone.trim();
      if (formattedPhone.startsWith('0')) {
        formattedPhone = `+234${formattedPhone.slice(1)}`;
      }
      if (!formattedPhone.startsWith('+')) {
        formattedPhone = `+${formattedPhone}`;
      }

      try {
        await twilioClient.messages.create({
          from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER || '+14155238886'}`, // Twilio Sandbox or live WhatsApp sender number
          to: `whatsapp:${formattedPhone}`,
          body: `*GREENHOUSE ORDER CONFIRMED* 🌿\n\nHello ${order.customerName},\nYour payment of *₦${order.totalAmount.toLocaleString()}* was successful.\n\n*Order ID:* ${order.orderId}\nWe are preparing your delivery right away! 🚀`
        });
      } catch (smsErr) {
        console.error("WhatsApp delivery block fail:", smsErr);
        // We catch here so OPay still gets its clean acknowledgement even if WhatsApp API limits hit
      }

      return NextResponse.json({ code: "00000", message: "SUCCESS" }, { status: 200 });
    } else {
      order.paymentStatus = 'FAILED';
      await order.save();
      return NextResponse.json({ code: "00000", message: "FAILED_ACKNOWLEDGED" }, { status: 200 });
    }

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}