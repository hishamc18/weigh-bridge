import mongoose, { Schema, model, models } from 'mongoose';

export interface IUserDoc extends mongoose.Document {
  username: string;
  password: string;
  sessionExpiryDays: number;
}

const UserSchema = new Schema<IUserDoc>(
  {
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    sessionExpiryDays: { type: Number, default: 10, min: 1, max: 365 },
  },
  { timestamps: true }
);

export const User = models.User ?? model<IUserDoc>('User', UserSchema);