import Bowser from 'bowser'
import { NextResponse } from 'next/server'
import { CLICK_REDIRECT_DELAY_MS, IPINFO_API_BASE } from '@/lib/constants'
import { getLongUrl } from '@/db/apiUrls'
import supabase from '@/db/supabase'
import { isSafeUrl } from '@/lib/utils'

function isValidIpv4(ip) {
  const parts = ip.split('.')
  if (parts.length !== 4) return false
  return parts.every((p) => /^\d{1,3}$/.test(p) && parseInt(p, 10) <= 255)
}

export async function GET(request, { params }) {
  const { id } = await params

  const shortLinkData = await getLongUrl(id)
  if (!shortLinkData || !shortLinkData.original_url) {
    return NextResponse.json({ error: 'Short link not found' }, { status: 404 })
  }

  if (!isSafeUrl(shortLinkData.original_url)) {
    return NextResponse.json({ error: 'Invalid redirect target' }, { status: 400 })
  }

  const rawIp = (request.headers.get('x-forwarded-for') || '').split(',')[0].trim()
  const clientIp = isValidIpv4(rawIp) ? rawIp : null

  let city = ''
  let country = ''
  if (clientIp) {
    try {
      const geoRes = await fetch(`${IPINFO_API_BASE}${clientIp}?token=${process.env.IPINFO_TOKEN}`)
      const geoData = await geoRes.json()
      city = geoData.city || ''
      country = geoData.country || ''
    } catch (err) {
      console.error('ipinfo error:', err)
    }
  }

  const userAgent = request.headers.get('user-agent') || ''
  const parsed = Bowser.parse(userAgent)
  const device = parsed.platform?.type

  const { error } = await supabase.from('clicks').insert({
    url_id: shortLinkData.id,
    city: city,
    country: country,
    device: device,
  })
  await new Promise((resolve) => setTimeout(resolve, CLICK_REDIRECT_DELAY_MS))
  if (error) {
    console.error('Error inserting click:', error.message)
    // if error then also redirect, don't want users to get stuck
    return NextResponse.redirect(shortLinkData.original_url, 302)
  }

  // 5) Do a server-side 302 redirect to the original URL
  return NextResponse.redirect(shortLinkData.original_url, 302)
}
