import { auth } from "@/lib/better-auth"

export async function GET(request: Request) {
  console.log('Microsoft callback called:', request.url)
  return auth.handler(request)
}

export async function POST(request: Request) {
  console.log('Microsoft callback called:', request.url)
  return auth.handler(request)
}