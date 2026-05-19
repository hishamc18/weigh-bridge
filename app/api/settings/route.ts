import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { getSession } from '@/lib/auth';

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    await connectDB();
    const { currentPassword, newPassword, sessionExpiryDays } = await req.json();

    const user = await User.findById(session.userId);
    if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });

    // If changing password
    if (currentPassword && newPassword) {
      const valid = await bcrypt.compare(currentPassword, user.password);
      if (!valid) {
        return NextResponse.json({ success: false, error: 'Current password is incorrect' }, { status: 400 });
      }
      user.password = await bcrypt.hash(newPassword, 12);
    }

    if (sessionExpiryDays !== undefined) {
      user.sessionExpiryDays = Number(sessionExpiryDays);
    }

    await user.save();
    return NextResponse.json({ success: true, message: 'Settings updated' });
  } catch (err) {
    console.error('[SETTINGS]', err);
    return NextResponse.json({ success: false, error: 'Failed to update settings' }, { status: 500 });
  }
}