import Bowser from 'bowser'
import { NextResponse } from 'next/server'
import { IPINFO_API_BASE } from '@/lib/constants'
import supabaseAdmin from '@/db/supabase-admin'
import { isSafeUrl } from '@/lib/utils'

function isValidIpv4(ip) {
  const parts = ip.split('.')
  if (parts.length !== 4) return false
  return parts.every((p) => /^\d{1,3}$/.test(p) && parseInt(p, 10) <= 255)
}

export async function GET(request, { params }) {
  const { id } = await params

  const { data: shortLinkData, error: urlError } = await supabaseAdmin
    .from('urls')
    .select('id, original_url')
    .or(`short_url.eq.${id},custom_url.eq.${id}`)
    .single()

  if (urlError || !shortLinkData?.original_url) {
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
  const device = Bowser.parse(userAgent).platform?.type

  const { error: clickError } = await supabaseAdmin.from('clicks').insert({
    url_id: shortLinkData.id,
    city,
    country,
    device,
  })

  if (clickError) console.error('Error inserting click:', clickError.message)

  return NextResponse.redirect(shortLinkData.original_url, 302)
}
