import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/contexts/AuthContext'
import { CookieConsentProvider } from '@/contexts/CookieConsentContext'
import { CookieConsentBanner } from '@/components/CookieConsentBanner'
import { CookieSettingsModal } from '@/components/CookieSettingsModal'
import MainNavigation from '@/components/MainNavigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Findamine Admin Dashboard',
  description: 'Administrative dashboard for the Findamine geo-caching game platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CookieConsentProvider>
          <AuthProvider>
            <MainNavigation />
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
              }}
            />
            <CookieConsentBanner />
            <CookieSettingsModal />
          </AuthProvider>
        </CookieConsentProvider>
      </body>
    </html>
  )
} 