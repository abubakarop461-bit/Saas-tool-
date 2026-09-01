import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  return NextResponse.json({ message: 'Backend is in disconnected mode. Seed DB endpoint is disabled.' });
}
