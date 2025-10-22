import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ 
    message: 'Better Auth API is working',
    timestamp: new Date().toISOString()
  })
}