import mongoose, { Schema, model, models } from 'mongoose';

export interface IShopDoc extends mongoose.Document {
  title: string;
  location: string;
  weight: number;
}

const ShopSchema = new Schema<IShopDoc>(
  {
    title: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    weight: { type: Number, required: true },
  },
  { timestamps: true }
);

export const Shop = models.Shop ?? model<IShopDoc>('Shop', ShopSchema);