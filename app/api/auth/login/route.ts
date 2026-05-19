import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { signToken, setSessionCookie } from '@/lib/auth';
import { rateLimit } from '@/lib/ratelimit';
import { getIp } from '@/lib/utils';

export async function POST(req: NextRequest) {
  const ip = getIp(req);
  const { allowed } = rateLimit(`login:${ip}`, { limit: 10, windowMs: 60_000 });
  if (!allowed) {
    return NextResponse.json({ success: false, error: 'Too many requests' }, { status: 429 });
  }

  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ success: false, error: 'Username and password required' }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOne({ username: username.toLowerCase().trim() });
    if (!user) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }

    const token = await signToken(
      { userId: user._id.toString(), username: user.username },
      user.sessionExpiryDays
    );

    await setSessionCookie(token, user.sessionExpiryDays);

    return NextResponse.json({
      success: true,
      data: { username: user.username },
    });
  } catch (err) {
    console.error('[LOGIN]', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}