// import { auth } from "@/lib/better-auth"
// import { NextResponse } from "next/server"

// export async function GET() {
//   try {
//     // Crear una request de prueba
//     const testRequest = new Request("http://localhost:3000/api/auth/providers")
//     console.log('Testing auth handler...')
    
//     const response = await auth.handler(testRequest)
//     console.log('Auth handler response status:', response.status)
    
//     return NextResponse.json({ 
//       message: 'Auth handler test',
//       status: response.status,
//       betterAuthWorking: true
//     })
//   } catch (error) {
//     console.error('Auth handler error:', error)
//     return NextResponse.json({ 
//       error: error.message,
//       betterAuthWorking: false
//     }, { status: 500 })
//   }
// }