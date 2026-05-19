import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'fallback_secret_change_in_production_32ch'
);

export interface JWTPayload {
  userId: string;
  username: string;
}

export async function signToken(payload: JWTPayload, expiryDays: number = 10): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${expiryDays}d`)
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('wb_session')?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function setSessionCookie(token: string, expiryDays: number = 10) {
  const cookieStore = await cookies();
  cookieStore.set('wb_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: expiryDays * 24 * 60 * 60,
    path: '/',
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete('wb_session');
}