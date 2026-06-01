'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { use, useEffect, useMemo, useState } from 'react'
import { Btn, CountUp, Icon, Sk, useToast } from '@/components/ds'
import { BarChart, DonutChart } from '@/components/ds-charts'
import { UrlState } from '@/context/url-provider'
import { getClicksForUrl } from '@/db/apiClicks'
import { deleteUrl, getUrl } from '@/db/apiUrls'
import useFetch from '@/hooks/use-fetch'
import { BASE_APP_DOMAIN, FEEDBACK_TIMEOUT_MS } from '@/lib/constants'

function fmt(n) {
  return (n || 0).toLocaleString('en-US')
}

function fmtDate(ts) {
  if (!ts) return ''
  return new Date(ts).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function relDate(ts) {
  if (!ts) return ''
  const d = Math.floor((Date.now() - new Date(ts).getTime()) / 86400000)
  if (d <= 0) return 'today'
  if (d === 1) return 'yesterday'
  if (d < 30) return `${d}d ago`
  if (d < 365) return `${Math.floor(d / 30)}mo ago`
  return `${Math.floor(d / 365)}y ago`
}

/* Transform raw clicks array to analytics shape */
function transformStats(stats) {
  if (!stats?.length) {
    return { total: 0, cities: [], devices: { mobile: 0, desktop: 0, tablet: 0 } }
  }
  const cityCount = {}
  const devices = { mobile: 0, desktop: 0, tablet: 0 }
  for (const s of stats) {
    if (s.city) cityCount[s.city] = (cityCount[s.city] || 0) + 1
    const d = (s.device || '').toLowerCase()
    if (d === 'mobile') devices.mobile++
    else if (d === 'desktop') devices.desktop++
    else if (d === 'tablet') devices.tablet++
  }
  const cities = Object.entries(cityCount)
    .map(([name, clicks]) => ({ name, clicks }))
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 5)
  return { total: stats.length, cities, devices }
}

/* ---- Action button ---- */
function ActionBtn({ icon, label, onClick, variant, active }) {
  const danger = variant === 'danger'
  return (
    <button
      onClick={onClick}
      className="row detail-action"
      style={{
        gap: 9,
        padding: '11px 16px',
        borderRadius: 'var(--r-md)',
        fontWeight: 700,
        fontSize: 14.5,
        cursor: 'pointer',
        border: '1px solid',
        transition: 'all .16s var(--ease)',
        background: active
          ? 'var(--success-soft)'
          : danger
          ? 'var(--danger-soft)'
          : 'var(--surface)',
        borderColor: active
          ? 'transparent'
          : danger
          ? 'var(--danger-line)'
          : 'var(--border-2)',
        color: active ? 'var(--success)' : danger ? 'var(--danger)' : 'var(--ink)',
      }}
      onMouseEnter={(e) => {
        if (danger) {
          e.currentTarget.style.background = 'var(--danger)'
          e.currentTarget.style.color = '#fff'
          e.currentTarget.style.borderColor = 'var(--danger)'
        } else if (!active) {
          e.currentTarget.style.background = 'var(--surface-2)'
          e.currentTarget.style.borderColor = 'var(--ink-3)'
        }
      }}
      onMouseLeave={(e) => {
        if (danger) {
          e.currentTarget.style.background = 'var(--danger-soft)'
          e.currentTarget.style.color = 'var(--danger)'
          e.currentTarget.style.borderColor = 'var(--danger-line)'
        } else if (!active) {
          e.currentTarget.style.background = 'var(--surface)'
          e.currentTarget.style.borderColor = 'var(--border-2)'
        }
      }}
    >
      <Icon name={active ? 'check' : icon} size={17} />
      {active ? 'Done' : label}
    </button>
  )
}

/* ---- Analytics skeleton ---- */
function AnalyticsSkeleton() {
  return (
    <div
      className="detail-analytics"
      style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20 }}
    >
      <div className="card card-pad col" style={{ gap: 18 }}>
        <Sk w={120} h={16} />
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="col" style={{ gap: 7 }}>
            <Sk w="40%" h={13} />
            <Sk w="100%" h={12} r={99} />
          </div>
        ))}
      </div>
      <div className="card card-pad col center" style={{ gap: 18 }}>
        <Sk w={120} h={16} style={{ alignSelf: 'flex-start' }} />
        <Sk w={170} h={170} r={99} />
      </div>
    </div>
  )
}

/* ---- Analytics empty ---- */
function AnalyticsEmpty() {
  return (
    <div
      className="card"
      style={{
        padding: '56px 32px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 14,
        borderStyle: 'dashed',
        background: 'var(--surface-2)',
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 16,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--primary)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <Icon name="chart" size={28} />
      </div>
      <h3 style={{ fontSize: 21 }}>No clicks yet</h3>
      <p
        style={{ color: 'var(--ink-2)', fontSize: 15, maxWidth: 360, lineHeight: 1.55 }}
      >
        Share your short link or QR code — the moment someone visits, their city and device
        show up right here.
      </p>
      <div className="row" style={{ gap: 8, marginTop: 4 }}>
        <span className="badge badge-muted">
          <Icon name="mapPin" size={13} /> City data
        </span>
        <span className="badge badge-muted">
          <Icon name="smartphone" size={13} /> Device split
        </span>
      </div>
    </div>
  )
}

export default function LinkPage({ params }) {
  const { id } = use(params)
  const { user } = UrlState()
  const router = useRouter()
  const toast = useToast()
  const [copied, setCopied] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const { loading, data: url, fn: fnGetUrl, error } = useFetch(getUrl, { id, user_id: user?.id })
  const { loading: loadingStats, data: stats, fn: fnStats } = useFetch(getClicksForUrl, {
    url_id: id,
    user_id: user?.id,
  })
  const { loading: loadingDelete, fn: fnDelete } = useFetch(deleteUrl, {
    id,
    user_id: user?.id,
  })

  useEffect(() => {
    if (user?.id) fnGetUrl()
  }, [user])

  useEffect(() => {
    if (!error && loading === false) fnStats()
  }, [loading, error])

  useEffect(() => {
    if (error) router.push('/dashboard')
  }, [error])

  const shortCode = url?.custom_url || url?.short_url
  const shortUrl = shortCode ? `${BASE_APP_DOMAIN}/${shortCode}` : ''
  const fullShort = shortUrl ? 'https://' + shortUrl : ''

  const analytics = useMemo(() => transformStats(stats), [stats])
  const hasClicks = analytics.total > 0

  const copy = () => {
    if (!fullShort) return
    navigator.clipboard?.writeText(fullShort)
    setCopied(true)
    toast?.('Short link copied to clipboard', 'info')
    setTimeout(() => setCopied(false), FEEDBACK_TIMEOUT_MS)
  }

  const downloadImage = async () => {
    const imageUrl = url?.qr_code
    if (!imageUrl) return
    try {
      setDownloading(true)
      const res = await fetch(imageUrl)
      const blob = await res.blob()
      const blobUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = `${url?.title || 'qr'}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(blobUrl)
      toast?.('QR code downloaded as PNG')
      setTimeout(() => setDownloading(false), FEEDBACK_TIMEOUT_MS)
    } catch {
      setDownloading(false)
    }
  }

  const handleDelete = async () => {
    await fnDelete()
    toast?.('Link deleted', 'danger')
    router.push('/dashboard')
  }

  if (loading) {
    return (
      <div className="wrap anim-in detail-mono" style={{ maxWidth: 1080, padding: '28px 24px 80px' }}>
        <Sk w={140} h={20} style={{ marginBottom: 24 }} />
        <div className="card" style={{ padding: 26, marginBottom: 20 }}>
          <Sk w="60%" h={28} style={{ marginBottom: 14 }} />
          <Sk w="40%" h={20} style={{ marginBottom: 8 }} />
          <Sk w="70%" h={14} style={{ marginBottom: 16 }} />
          <div className="row" style={{ gap: 10 }}>
            <Sk w={120} h={42} r={11} />
            <Sk w={120} h={42} r={11} />
            <Sk w={100} h={42} r={11} />
          </div>
        </div>
        <AnalyticsSkeleton />
      </div>
    )
  }

  if (!url) return null

  return (
    <div
      className="wrap anim-in detail-mono"
      style={{ maxWidth: 1080, padding: '28px 24px 80px' }}
    >
      {/* back nav */}
      <Link
        href="/dashboard"
        className="row"
        style={{
          gap: 7,
          color: 'var(--ink-2)',
          fontWeight: 600,
          fontSize: 14.5,
          padding: '6px 0',
          marginBottom: 18,
          width: 'fit-content',
          transition: 'color .14s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--ink)')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--ink-2)')}
      >
        <Icon name="arrowLeft" size={17} /> Back to dashboard
      </Link>

      {/* top card */}
      <div
        className="card detail-top"
        style={{
          padding: 26,
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: 28,
          marginBottom: 20,
        }}
      >
        <div className="col" style={{ gap: 16, minWidth: 0 }}>
          <div className="col" style={{ gap: 10 }}>
            <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: 25 }}>{url.title}</h1>
              {url.custom_url && (
                <span className="badge badge-violet">custom alias</span>
              )}
            </div>

            <a
              href={fullShort}
              target="_blank"
              rel="noreferrer"
              className="row"
              style={{ gap: 8, width: 'fit-content', maxWidth: '100%' }}
              onMouseEnter={(e) => {
                const s = e.currentTarget.querySelector('.su')
                if (s) s.style.textDecoration = 'underline'
              }}
              onMouseLeave={(e) => {
                const s = e.currentTarget.querySelector('.su')
                if (s) s.style.textDecoration = 'none'
              }}
            >
              <span
                className="su mono"
                style={{
                  fontSize: 'clamp(20px,3vw,27px)',
                  fontWeight: 600,
                  color: 'var(--primary)',
                  letterSpacing: '-.02em',
                }}
              >
                {shortUrl}
              </span>
              <Icon
                name="external"
                size={18}
                style={{ color: 'var(--primary)', flex: 'none' }}
              />
            </a>

            <a
              href={url.original_url}
              target="_blank"
              rel="noreferrer"
              className="row"
              style={{ gap: 7, color: 'var(--ink-3)', fontSize: 14, minWidth: 0, transition: 'color .14s' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--ink-2)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--ink-3)')}
            >
              <Icon name="arrowUpRight" size={15} style={{ flex: 'none' }} />
              <span
                style={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {url.original_url}
              </span>
            </a>

            <span
              className="row"
              style={{ gap: 6, fontSize: 13.5, color: 'var(--ink-3)', fontWeight: 500 }}
            >
              <Icon name="calendar" size={14} /> Created {fmtDate(url.created_at)} ·{' '}
              {relDate(url.created_at)}
            </span>
          </div>

          <div
            className="row detail-actions"
            style={{ gap: 10, flexWrap: 'wrap', marginTop: 'auto' }}
          >
            <ActionBtn icon="copy" label="Copy link" onClick={copy} active={copied} />
            <ActionBtn
              icon="download"
              label="Download QR"
              onClick={downloadImage}
              active={downloading}
            />
            {!showDeleteConfirm ? (
              <ActionBtn
                icon="trash"
                label="Delete"
                variant="danger"
                onClick={() => setShowDeleteConfirm(true)}
              />
            ) : (
              <div className="row" style={{ gap: 8 }}>
                <ActionBtn
                  icon="trash"
                  label="Confirm delete"
                  variant="danger"
                  onClick={handleDelete}
                  active={loadingDelete}
                />
                <ActionBtn
                  icon="x"
                  label="Cancel"
                  onClick={() => setShowDeleteConfirm(false)}
                />
              </div>
            )}
          </div>
        </div>

        {/* QR code */}
        <div className="detail-qr col center" style={{ gap: 12 }}>
          {url.qr_code ? (
            <div className="qr-card" style={{ padding: 14 }}>
              <Image
                src={url.qr_code}
                width={188}
                height={188}
                alt="QR code"
                style={{ display: 'block', borderRadius: 4 }}
              />
            </div>
          ) : (
            <div
              className="qr-empty"
              style={{ width: 196, height: 196 }}
            >
              <Icon name="qr" size={28} />
              <span style={{ fontSize: 12.5, fontWeight: 600 }}>No QR available</span>
            </div>
          )}
          <span className="mono" style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>
            scan to open
          </span>
        </div>
      </div>

      {/* analytics header */}
      <div
        className="row"
        style={{ justifyContent: 'space-between', alignItems: 'center', margin: '4px 2px 16px' }}
      >
        <h2 style={{ fontSize: 21 }}>Analytics</h2>
        {!loadingStats && hasClicks && (
          <span className="badge badge-muted">
            <span className="dot" style={{ background: 'var(--success)' }} /> tracking live
          </span>
        )}
      </div>

      {loadingStats ? (
        <AnalyticsSkeleton />
      ) : !hasClicks ? (
        <AnalyticsEmpty />
      ) : (
        <div className="col" style={{ gap: 20 }}>
          {/* big number */}
          <div
            className="card detail-bignum"
            style={{
              padding: 26,
              display: 'flex',
              gap: 26,
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <div className="col" style={{ gap: 2 }}>
              <span className="eyebrow">Total clicks</span>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(38px,5.5vw,58px)',
                  fontWeight: 700,
                  letterSpacing: '-.03em',
                  lineHeight: 1,
                }}
              >
                <CountUp value={analytics.total} />
              </span>
            </div>
            <div
              className="detail-divider"
              style={{ width: 1, height: 56, background: 'var(--border)' }}
            />
            <div className="row" style={{ gap: 22, flexWrap: 'wrap' }}>
              <div className="col">
                <span
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    fontFamily: 'var(--font-display)',
                  }}
                >
                  {analytics.cities.length}
                </span>
                <span style={{ fontSize: 12.5, color: 'var(--ink-3)', fontWeight: 600 }}>
                  cities reached
                </span>
              </div>
              <div className="col">
                <span
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    fontFamily: 'var(--font-display)',
                  }}
                >
                  {analytics.cities[0]?.name || '—'}
                </span>
                <span style={{ fontSize: 12.5, color: 'var(--ink-3)', fontWeight: 600 }}>
                  top city
                </span>
              </div>
            </div>
          </div>

          {/* charts */}
          <div
            className="detail-analytics"
            style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20 }}
          >
            <div className="card card-pad">
              <div
                className="row"
                style={{ justifyContent: 'space-between', marginBottom: 20 }}
              >
                <h3
                  style={{
                    fontSize: 17,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <Icon name="mapPin" size={17} style={{ color: 'var(--primary)' }} /> Top
                  cities
                </h3>
                <span className="badge badge-muted">top 5</span>
              </div>
              <BarChart data={analytics.cities} />
            </div>
            <div className="card card-pad">
              <div className="row" style={{ marginBottom: 20 }}>
                <h3
                  style={{
                    fontSize: 17,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <Icon name="smartphone" size={17} style={{ color: 'var(--violet)' }} />{' '}
                  Devices
                </h3>
              </div>
              <DonutChart devices={analytics.devices} size={180} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
