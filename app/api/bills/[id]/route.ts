import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Bill } from '@/models/Bill';
import { getSession } from '@/lib/auth';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const { id } = await params;
  const bill = await Bill.findById(id).populate('shop');
  if (!bill) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
  return NextResponse.json({ success: true, data: bill });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const netWeight = (body.grossWeight ?? 0) - (body.tareWeight ?? 0);

    const bill = await Bill.findByIdAndUpdate(
      id,
      {
        ...body,
        netWeight,
        vehicleNo: body.vehicleNo?.toUpperCase(),
        material: body.material?.toUpperCase(),
      },
      { new: true }
    ).populate('shop');

    if (!bill) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: bill });
  } catch (err) {
    console.error('[BILL UPDATE]', err);
    return NextResponse.json({ success: false, error: 'Failed to update bill' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const { id } = await params;
  await Bill.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}