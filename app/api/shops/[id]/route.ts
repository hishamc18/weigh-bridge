import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Shop } from '@/models/Shop';
import { getSession } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const shop = await Shop.findByIdAndUpdate(id, body, { new: true });
    if (!shop) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: shop });
  } catch (err) {
    console.error('[SHOP UPDATE]', err);
    return NextResponse.json({ success: false, error: 'Failed to update shop' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const { id } = await params;
  await Shop.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}