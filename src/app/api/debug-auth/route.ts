import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Intentar importar Better Auth
    const { auth } = await import("@/lib/better-auth")
    
    // Verificar que se creó correctamente
    return NextResponse.json({
      betterAuthLoaded: true,
      hasHandler: typeof auth.handler === 'function',
      hasClientId: !!process.env.MICROSOFT_CLIENT_ID,
      hasClientSecret: !!process.env.MICROSOFT_CLIENT_SECRET,
      message: 'Better Auth is configured'
    })
  } catch (error) {
    const err = error as Error
    return NextResponse.json({
      betterAuthLoaded: false,
      error: err.message,
      stack: err.stack
    }, { status: 500 })
  }
}