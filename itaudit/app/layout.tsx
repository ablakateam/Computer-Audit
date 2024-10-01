import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { DarkModeProvider } from './contexts/DarkModeContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'IT Audit',
  description: 'IT Audit Application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <DarkModeProvider>
          {children}
        </DarkModeProvider>
      </body>
    </html>
  )
}
