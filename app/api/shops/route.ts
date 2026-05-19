import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Shop } from '@/models/Shop';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const shops = await Shop.find().sort({ createdAt: -1 });
  return NextResponse.json({ success: true, data: shops });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    await connectDB();
    const body = await req.json();
    const shop = await Shop.create(body);
    return NextResponse.json({ success: true, data: shop }, { status: 201 });
  } catch (err) {
    console.error('[SHOP CREATE]', err);
    return NextResponse.json({ success: false, error: 'Failed to create shop' }, { status: 500 });
  }
}