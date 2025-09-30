import { ThemeProvider } from "@/components/theme-provider";
export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-24">
          {children}
      </div>
    </ThemeProvider>
  )
}