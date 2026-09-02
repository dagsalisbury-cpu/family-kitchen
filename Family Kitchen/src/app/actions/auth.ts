'use server';

import { cookies } from 'next/headers';

export async function verifyPin(pin: string) {
  const hostPin = process.env.HOST_PIN || '1234'; // Default for local dev if not set
  if (pin === hostPin) {
    const cookieStore = await cookies();
    cookieStore.set('auth_role', 'host', { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/'
    });
    return { success: true };
  }
  return { success: false, error: 'Invalid PIN' };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('auth_role');
}

export async function checkIsHost() {
  const cookieStore = await cookies();
  return cookieStore.get('auth_role')?.value === 'host';
}
