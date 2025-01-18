import localFont from 'next/font/local'
import './globals.css'
import Header from '@/components/Header'
import { BackgroundBeams } from '@/components/ui/background-beams'
import Footer from '@/components/Footer'
import UrlProvider from '@/context/url-provider'

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900'
})
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900'
})

export const metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app'
}

export default function RootLayout ({ children }) {
  return (
    <html lang='en'>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <UrlProvider>
          <Header />
          <main className='min-h-screen container mx-auto px-6'>
            {children}
          </main>
          <Footer />
        </UrlProvider>
      </body>
    </html>
  )
}
