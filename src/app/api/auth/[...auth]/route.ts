import { auth } from "@/lib/better-auth"

export async function GET(request: Request) {
  //console.log('GET - Auth route called with URL:', request.url)
  try {
    const response = await auth.handler(request)
    //console.log('Auth handler response status:', response.status)
    return response
  } catch (error) {
    console.error('Auth handler error:', error)
    return new Response(JSON.stringify({ error: 'Auth handler failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

export async function POST(request: Request) {
  //console.log('POST - Auth route called with URL:', request.url)
  try {
    const response = await auth.handler(request)
    //console.log('Auth handler response status:', response.status)
    return response
  } catch (error) {
    console.error('Auth handler error:', error)
    return new Response(JSON.stringify({ error: 'Auth handler failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}