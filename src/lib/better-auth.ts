import { betterAuth } from "better-auth"

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET || "fallback-secret-key-for-development",
  
  emailAndPassword: {
    enabled: false, // Desactivamos email/password
  },
  
  socialProviders: {
    microsoft: {
      clientId: process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID as string,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET as string,
      tenantId: process.env.NEXT_PUBLIC_AZURE_TENANT_ID || 'common',
      authority: "https://login.microsoftonline.com",
      prompt: "select_account",
      scope: ["openid", "profile", "email", "User.Read"],
    }
  },
  
  // TODO: Implementar hooks para sincronización con backend cuando sea necesario
  // Los callbacks no están disponibles en better-auth como en NextAuth
  
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 días
    updateAge: 60 * 60 * 24, // actualizar cada día
  },
})

export type Session = typeof auth.$Infer.Session