import mongoose, { Schema, model, models } from 'mongoose';

export interface IBillDoc extends mongoose.Document {
  billNo: string;
  shop: mongoose.Types.ObjectId;
  vehicleNo: string;
  printDate: string;
  material: string;
  grossWeight: number;
  grossTime: string;
  tareWeight: number;
  tareTime: string;
  netWeight: number;
  weighmentCharges: number;
  operatorSign: string;
}

const BillSchema = new Schema<IBillDoc>(
  {
    billNo: { type: String, required: true, unique: true },
    shop: { type: Schema.Types.ObjectId, ref: 'Shop', required: true },
    vehicleNo: { type: String, required: true, uppercase: true, trim: true },
    printDate: { type: String, required: true },
    material: { type: String, default: 'SCRAP' },
    grossWeight: { type: Number, required: true },
    grossTime: { type: String, required: true },
    tareWeight: { type: Number, required: true },
    tareTime: { type: String, required: true },
    netWeight: { type: Number, required: true },
    weighmentCharges: { type: Number, default: 0 },
    operatorSign: { type: String, default: 'ADMIN' },
  },
  { timestamps: true }
);

export const Bill = models.Bill ?? model<IBillDoc>('Bill', BillSchema);