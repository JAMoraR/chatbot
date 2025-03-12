import { cn } from "@/lib/utils"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Inter } from "next/font/google"
import type { ReactNode } from "react"
import AuthProvider from '@/components/providers/session-provider';
import './globals.css'

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "OpenAI and AI SDK Chatbot",
  description: "A simple chatbot built using the AI SDK and gpt-4o-mini.",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en" className={inter.className}>
      <body className={cn("min-h-screen bg-background antialiased")}>
        <AuthProvider>
          <TooltipProvider>
            {children}
          </TooltipProvider>
        </AuthProvider>
      </body>
    </html>
  );
}