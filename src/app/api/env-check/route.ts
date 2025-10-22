import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    hasClientId: !!process.env.MICROSOFT_CLIENT_ID,
    hasClientSecret: !!process.env.MICROSOFT_CLIENT_SECRET,
    baseURL: process.env.NEXT_PUBLIC_APP_URL,
    clientIdLength: process.env.MICROSOFT_CLIENT_ID?.length || 0
  })
}