import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Bill } from '@/models/Bill';
import { getSession } from '@/lib/auth';

// GET /api/bills — list all bills (populated with shop)
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const bills = await Bill.find().populate('shop').sort({ createdAt: -1 });
  return NextResponse.json({ success: true, data: bills });
}

// POST /api/bills — create bill
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    await connectDB();
    const body = await req.json();

    // Auto-generate unique billNo
    const last = await Bill.findOne().sort({ createdAt: -1 }).select('billNo');
    let nextNo = 10001;
    if (last?.billNo) {
      const num = parseInt(last.billNo, 10);
      if (!isNaN(num)) nextNo = num + 1;
    }

    // Ensure uniqueness with a loop (handles concurrent requests)
    let billNo = String(nextNo);
    let exists = await Bill.exists({ billNo });
    while (exists) {
      nextNo++;
      billNo = String(nextNo);
      exists = await Bill.exists({ billNo });
    }

    const netWeight = (body.grossWeight ?? 0) - (body.tareWeight ?? 0);

    const bill = await Bill.create({
      ...body,
      billNo,
      netWeight,
      vehicleNo: body.vehicleNo?.toUpperCase(),
      material: body.material?.toUpperCase() || 'SCRAP',
      operatorSign: 'ADMIN',
    });

    const populated = await bill.populate('shop');
    return NextResponse.json({ success: true, data: populated }, { status: 201 });
  } catch (err) {
    console.error('[BILL CREATE]', err);
    return NextResponse.json({ success: false, error: 'Failed to create bill' }, { status: 500 });
  }
}