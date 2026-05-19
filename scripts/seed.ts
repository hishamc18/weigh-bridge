import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from 'dotenv';

config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI!;
console.log(MONGODB_URI);

const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  sessionExpiryDays: { type: Number, default: 10 },
});

const ShopSchema = new mongoose.Schema({
  title: String,
  location: String,
  weight: Number,
});

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  const User = mongoose.models.User ?? mongoose.model('User', UserSchema);
  const Shop = mongoose.models.Shop ?? mongoose.model('Shop', ShopSchema);

  // Create admin user
  const existing = await User.findOne({ username: 'admin' });
  if (!existing) {
    const hashed = await bcrypt.hash('0909', 12);
    await User.create({ username: 'admin', password: hashed, sessionExpiryDays: 10 });
    console.log('✅ Admin user created  →  username: admin  |  password: admin123');
  } else {
    console.log('ℹ️  Admin user already exists');
  }

  // Create sample shop
  const shopCount = await Shop.countDocuments();
  if (shopCount === 0) {
    await Shop.create({
      title: 'Vattakkatt Weight Bridge',
      location: 'Kanjirappally Road Ponkunnam Kottayam Kerala-686506',
      weight: 80,
    });
    console.log('✅ Sample shop created');
  } else {
    console.log('ℹ️  Shops already exist');
  }

  await mongoose.disconnect();
  console.log('Done.');
}

seed().catch(console.error);