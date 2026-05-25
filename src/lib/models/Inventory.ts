import mongoose, { Schema, Document } from 'mongoose';

export interface IInventoryItem extends Document {
  productId: string;
  productName: string;
  variantArticle: string;
  variantColor: string;
  warehouse: 'warehouse1' | 'warehouse2';
  quantity: number;
  reservedQuantity: number;
  minQuantity: number;
  updatedAt: Date;
}

const InventorySchema = new Schema<IInventoryItem>(
  {
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    variantArticle: { type: String, required: true },
    variantColor: { type: String, required: true },
    warehouse: { type: String, enum: ['warehouse1', 'warehouse2'], required: true },
    quantity: { type: Number, default: 0 },
    reservedQuantity: { type: Number, default: 0 },
    minQuantity: { type: Number, default: 5 },
  },
  { timestamps: true }
);

InventorySchema.index({ variantArticle: 1, warehouse: 1 }, { unique: true });

export default mongoose.models.Inventory ||
  mongoose.model<IInventoryItem>('Inventory', InventorySchema);
