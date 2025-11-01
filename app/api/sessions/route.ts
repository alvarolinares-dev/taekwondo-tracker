import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const sessions = await kv.get('taekwondo-sessions') || [];
    return NextResponse.json(sessions);
  } catch (error) {
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const sessions = await request.json();
    await kv.set('taekwondo-sessions', sessions);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}