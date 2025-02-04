import localFont from 'next/font/local'
import './globals.css'
import Header from '@/components/Header'
import { BackgroundBeams } from '@/components/ui/background-beams'
import Footer from '@/components/Footer'
import UrlProvider from '@/context/url-provider'
import { Separator } from "@/components/ui/separator"

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
  title: 'Clippr',
  description: [
    'URL shortener with a focus on privacy and speed.',
    'Clippr is a URL shortener that allows you to shorten URLs and share them with your friends.',
    'Gain insights into your audience and track your performance with Clippr.'
  ]
}

export default function RootLayout ({ children }) {
  return (
    <html lang='en'>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <UrlProvider>
          <Header />
         
          <main className='mt-20 min-h-screen container mx-auto px-2'>
            {children}
          </main>
          <Footer />
        </UrlProvider>
      </body>
    </html>
  )
}
