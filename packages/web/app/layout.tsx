import type { Metadata } from "next"
import { Plus_Jakarta_Sans } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "sonner"
import { Suspense } from "react"
import type React from "react"
import "./globals.css"
import ClientLayout from "./client-layout"
import { AuthProvider } from "@/hooks/use-auth"

const sansFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans-app",
  display: "swap",
})

export const metadata: Metadata = {
  title: "MoedaMix - Dashboard Financeiro",
  description: "Sistema de gestão financeira para contas a pagar e receber",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className={`font-sans ${sansFont.variable}`}>
        <Suspense fallback={null}>
          <AuthProvider>
            <ClientLayout>{children}</ClientLayout>
          </AuthProvider>
        </Suspense>
        <Toaster position="top-right" />
        <Analytics />
      </body>
    </html>
  )
}
