import type { Metadata, Viewport } from "next";

import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1f4788" },
    { media: "(prefers-color-scheme: dark)", color: "#1f4788" },
  ],
};

export const metadata: Metadata = {
  title: {
    default: "HDM - Help Desk Mefasa",
    template: "%s | HDM",
  },
  description: "Sistema de Help Desk para Mefasa - Gestión eficiente de tickets y soporte técnico",
  keywords: ["help desk", "soporte técnico", "tickets", "mefasa", "gestión"],
  authors: [{ name: "Mefasa Team" }],
  creator: "Mefasa",
  publisher: "Mefasa",
  robots: {
    index: false, // Internal application
    follow: false,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" }
    ],
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.ico",
  },
  manifest: "/manifest.json",
};

interface RootLayoutProps {
  readonly children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <AuthProvider>
          <ThemeProvider 
            attribute="class" 
            defaultTheme="system" 
            enableSystem 
            disableTransitionOnChange
          >
            <div id="app-root" className="relative flex min-h-screen flex-col">
              {children}
            </div>
            <Toaster 
              richColors 
              position="top-right" 
              closeButton
              duration={4000}
              toastOptions={{
                classNames: {
                  error: 'border-destructive',
                  success: 'border-green-500',
                  warning: 'border-yellow-500',
                  info: 'border-blue-500',
                },
              }}
            />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}