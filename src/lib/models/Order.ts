import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem {
  productId: string;
  productName: string;
  variantArticle: string;
  variantColor: string;
  image: string;
  price: number;
  quantity: number;
}

export type OrderStatus =
  | 'new'
  | 'processing'
  | 'invoice_created'
  | 'shipped'
  | 'in_transit'
  | 'delivered'
  | 'received'
  | 'paid'
  | 'cancelled';

export interface IOrder extends Document {
  orderNumber: string;
  customer: {
    name: string;
    phone: string;
    email: string;
    city: string;
    address: string;
  };
  items: IOrderItem[];
  totalAmount: number;
  status: OrderStatus;
  warehouse: 'warehouse1' | 'warehouse2';
  ttn?: string;
  invoiceNumber?: string;
  invoiceUrl?: string;
  notes?: string;
  source: 'store' | 'manual';
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
  productId: { type: String, required: true },
  productName: { type: String, required: true },
  variantArticle: { type: String, required: true },
  variantColor: { type: String, required: true },
  image: { type: String, default: '' },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
});

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true },
    customer: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String, default: '' },
      city: { type: String, default: '' },
      address: { type: String, default: '' },
    },
    items: [OrderItemSchema],
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['new', 'processing', 'invoice_created', 'shipped', 'in_transit', 'delivered', 'received', 'paid', 'cancelled'],
      default: 'new',
    },
    warehouse: { type: String, enum: ['warehouse1', 'warehouse2'], default: 'warehouse1' },
    ttn: { type: String },
    invoiceNumber: { type: String },
    invoiceUrl: { type: String },
    notes: { type: String },
    source: { type: String, enum: ['store', 'manual'], default: 'manual' },
  },
  { timestamps: true }
);

export default mongoose.models.Order ||
  mongoose.model<IOrder>('Order', OrderSchema);
