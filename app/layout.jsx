import localFont from 'next/font/local'
import './globals.css'
import Script from 'next/script'
import { ThemeProvider } from 'next-themes'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import UrlProvider from '@/context/url-provider'
import { ToastProvider } from '@/components/ds'

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
})
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
})

export const metadata = {
  title: 'Clippr — Short links that tell you everything',
  description:
    'Turn any URL into a clean short link with a built-in QR code, then watch clicks roll in by city and device.',
  openGraph: {
    title: 'Clippr — Short links that tell you everything',
    description:
      'Turn any URL into a clean short link with a built-in QR code, then watch clicks roll in by city and device.',
    url: 'https://clipr.vercel.app',
    siteName: 'Clippr',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Clippr' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Clippr — Short links that tell you everything',
    description:
      'Turn any URL into a clean short link with a built-in QR code, then watch clicks roll in by city and device.',
    images: ['/og.png'],
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ThemeProvider attribute="data-theme" defaultTheme="light" enableSystem={false}>
          <UrlProvider>
            <ToastProvider>
              <div className="app-bg" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                <Header />
                <main style={{ flex: 1 }}>{children}</main>
                <Footer />
              </div>
            </ToastProvider>
          </UrlProvider>
        </ThemeProvider>
      </body>
      <Script src="https://scripts.simpleanalyticscdn.com/latest.js" data-collect-dnt="true" />
    </html>
  )
}
