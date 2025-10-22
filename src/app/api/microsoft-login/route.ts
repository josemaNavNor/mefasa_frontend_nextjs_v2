import { signIn } from "@/lib/auth-client"
import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    message: "Use the button on /login page instead",
    redirectTo: "/login"
  })
}