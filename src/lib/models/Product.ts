import mongoose, { Schema, Document } from 'mongoose';

export interface IProductVariant {
  _id?: string;
  color: string;
  colorHex: string;
  article: string;
  images: string[];
  price: number;
  comparePrice?: number;
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  category: string;
  subcategory?: string;
  description: string;
  tags: string[];
  variants: IProductVariant[];
  isActive: boolean;
  isFeatured: boolean;
  isTopSale: boolean;
  topSaleBadge?: string;
  createdAt: Date;
  updatedAt: Date;
}

const VariantSchema = new Schema<IProductVariant>({
  color: { type: String, required: true },
  colorHex: { type: String, default: '#000000' },
  article: { type: String, required: true, unique: true },
  images: [{ type: String }],
  price: { type: Number, required: true },
  comparePrice: { type: Number },
});

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    subcategory: { type: String },
    description: { type: String, default: '' },
    tags: [{ type: String }],
    variants: [VariantSchema],
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    isTopSale: { type: Boolean, default: false },
    topSaleBadge: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Product ||
  mongoose.model<IProduct>('Product', ProductSchema);
