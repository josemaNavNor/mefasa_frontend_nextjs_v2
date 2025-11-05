import { betterAuth } from "better-auth"

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET || "QwWgN288cc4kZVSpyVl5W3WSAOWJYDkW",
  
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
  
  callbacks: {
    async signIn({ user, account }: { user: any; account: any }) {
      console.log('Usuario:', user);
      console.log('Datos de cuenta:', account);
      
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/microsoft-login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: user.email,
            name: user.name,
            microsoftId: user.id,
            accessToken: account.access_token,
          }),
        });

        if (response.ok) {
          const backendUser = await response.json();
          console.log('Usuario sincronizado con backend:', backendUser);
        } else {
          console.warn('No se pudo sincronizar con el backend');
        }
      } catch (error) {
        console.error(' Error al sincronizar con backend:', error);
        // Continuar con el login incluso si falla la sincronización
      }
      
      return true;
    },
  },
  
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 días
    updateAge: 60 * 60 * 24, // actualizar cada día
  },
})

export type Session = typeof auth.$Infer.Session