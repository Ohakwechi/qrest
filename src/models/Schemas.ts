// src/models/Schemas.ts
import mongoose, { Schema, model, models } from 'mongoose';

const ProductOptionSchema = new Schema({
  label: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  strain: { type: String, required: true },
  thc: { type: Number, required: true },
  cbd: { type: Number, required: true },
  image: { type: String, required: true },
  weight: { type: String, required: true }
});

const ProductGroupSchema = new Schema({
  name: { type: String, required: true },
  brand: { type: String, required: true },
  options: [ProductOptionSchema]
}, { timestamps: true });

const OrderItemSchema = new Schema({
  name: { type: String, required: true },       // The option label selected (e.g. "Rizla")
  parentGroup: { type: String, required: true }, // The parent group (e.g. "Rolling Tools")
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  weight: { type: String, required: true }
});

const OrderSchema = new Schema({
  orderId: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  items: [OrderItemSchema],
  totalAmount: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['PENDING', 'PAID', 'FAILED'], default: 'PENDING' }
}, { timestamps: true });

export const DbProduct = models.DbProduct || model('DbProduct', ProductGroupSchema);
export const DbOrder = models.DbOrder || model('DbOrder', OrderSchema);