'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { Btn, CountUp, Icon, Sk, useToast } from '@/components/ds'
import { UrlState } from '@/context/url-provider'
import { getClicksForUrls } from '@/db/apiClicks'
import { deleteUrl, getUrls } from '@/db/apiUrls'
import useFetch from '@/hooks/use-fetch'
import CreateLink from '@/components/create-link'
import { BASE_APP_DOMAIN } from '@/lib/constants'
import { Suspense } from 'react'

function fmt(n) {
  return (n || 0).toLocaleString('en-US')
}

function fmtDate(ts) {
  return new Date(ts).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function prettyUrl(u) {
  try {
    const x = new URL(u)
    return (x.hostname + x.pathname).replace(/\/$/, '')
  } catch {
    return u
  }
}

/* ---- Stat card ---- */
function StatCard({ icon, label, value, color, soft, loading }) {
  return (
    <div
      className="card"
      style={{ padding: 22, display: 'flex', gap: 16, alignItems: 'center', flex: 1, minWidth: 0 }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 11,
          flex: 'none',
          background: soft,
          color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name={icon} size={24} />
      </div>
      <div className="col" style={{ gap: 3, minWidth: 0 }}>
        {loading ? (
          <Sk w={84} h={28} />
        ) : (
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: '-.03em',
              lineHeight: 1,
            }}
          >
            <CountUp value={value} />
          </span>
        )}
        <span style={{ fontSize: 13.5, color: 'var(--ink-2)', fontWeight: 600 }}>{label}</span>
      </div>
    </div>
  )
}

/* ---- Link row skeleton ---- */
function LinkRowSkeleton() {
  return (
    <div className="card" style={{ padding: 16, display: 'flex', gap: 16, alignItems: 'center' }}>
      <Sk w={56} h={56} r={12} />
      <div className="col" style={{ gap: 8, flex: 1 }}>
        <Sk w="38%" h={16} />
        <Sk w="55%" h={12} />
        <Sk w="30%" h={11} />
      </div>
      <Sk w={120} h={38} r={10} />
    </div>
  )
}

/* ---- Link row ---- */
function LinkRow({ url, clicks, onDelete }) {
  const [copied, setCopied] = useState(false)
  const router = useRouter()
  const toast = useToast()
  const shortCode = url.custom_url || url.short_url
  const shortUrl = `${BASE_APP_DOMAIN}/${shortCode}`

  const copy = (e) => {
    e.stopPropagation()
    navigator.clipboard?.writeText('https://' + shortUrl)
    setCopied(true)
    toast?.('Short link copied to clipboard', 'info')
    setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div
      className="card link-row"
      onClick={() => router.push(`/link/${url.id}`)}
      style={{
        padding: 15,
        display: 'flex',
        gap: 16,
        alignItems: 'center',
        cursor: 'pointer',
        transition: 'transform .15s var(--ease),box-shadow .15s,border-color .15s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = 'var(--shadow-md)'
        e.currentTarget.style.borderColor = 'var(--border-2)'
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
        e.currentTarget.style.borderColor = 'var(--border)'
        e.currentTarget.style.transform = 'none'
      }}
    >
      {/* QR thumbnail */}
      {url.qr_code ? (
        <div
          className="qr-card"
          style={{ padding: 8, flex: 'none', width: 64, height: 64 }}
        >
          <Image
            src={url.qr_code}
            width={48}
            height={48}
            alt="QR"
            style={{ borderRadius: 3, display: 'block' }}
          />
        </div>
      ) : (
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 'var(--r-md)',
            background: 'var(--surface-2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 'none',
            color: 'var(--ink-3)',
          }}
        >
          <Icon name="qr" size={28} />
        </div>
      )}

      <div className="col link-row-main" style={{ gap: 5, flex: 1, minWidth: 0 }}>
        <div className="row" style={{ gap: 9, minWidth: 0 }}>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              fontSize: 16.5,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {url.title}
          </span>
          {url.custom_url && (
            <span className="badge badge-violet" style={{ flex: 'none' }}>
              alias
            </span>
          )}
        </div>
        <div className="row" style={{ gap: 8, minWidth: 0 }}>
          <span
            className="mono"
            style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--primary-2)', whiteSpace: 'nowrap' }}
          >
            {shortUrl}
          </span>
          <Icon name="arrowRight" size={13} style={{ color: 'var(--ink-3)', flex: 'none' }} />
          <span
            style={{
              fontSize: 13,
              color: 'var(--ink-3)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {prettyUrl(url.original_url)}
          </span>
        </div>
        <div className="row" style={{ gap: 14, marginTop: 2 }}>
          <span
            className="row"
            style={{ gap: 5, fontSize: 12.5, color: 'var(--ink-3)', fontWeight: 500 }}
          >
            <Icon name="calendar" size={13} /> {fmtDate(url.created_at)}
          </span>
          <span
            className="row"
            style={{ gap: 5, fontSize: 12.5, color: 'var(--ink-3)', fontWeight: 500 }}
          >
            <Icon name="cursor" size={13} /> {fmt(clicks)} clicks
          </span>
        </div>
      </div>

      <div
        className="row link-row-actions"
        style={{ gap: 8, flex: 'none' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className={`iconbtn ${copied ? 'is-ok' : ''}`}
          onClick={copy}
          title="Copy short URL"
          aria-label="copy"
        >
          <Icon name={copied ? 'check' : 'copy'} size={17} />
        </button>
        <button
          className="iconbtn is-danger"
          onClick={(e) => {
            e.stopPropagation()
            onDelete(url)
          }}
          title="Delete"
          aria-label="delete"
        >
          <Icon name="trash" size={17} />
        </button>
      </div>
    </div>
  )
}

/* ---- Empty state ---- */
function EmptyState({ onCreate }) {
  return (
    <div
      className="card"
      style={{
        padding: '64px 32px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 18,
        borderStyle: 'dashed',
        background: 'var(--surface-2)',
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
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
        <Icon name="link" size={32} />
      </div>
      <div className="col" style={{ gap: 8, alignItems: 'center' }}>
        <h3 style={{ fontSize: 24 }}>No links yet</h3>
        <p
          style={{ color: 'var(--ink-2)', fontSize: 16, maxWidth: 380, lineHeight: 1.55 }}
        >
          Shorten your first URL to get a clean link, a QR code, and click analytics — all in
          one place.
        </p>
      </div>
      <Btn size="lg" icon="plus" onClick={onCreate}>
        Create your first link
      </Btn>
    </div>
  )
}

/* ---- Dashboard page ---- */
export default function Dashboard() {
  const { user } = UrlState()
  const router = useRouter()
  const toast = useToast()
  const [q, setQ] = useState('')

  const { loading, error, data: urls, fn: fnUrls } = useFetch(getUrls, user?.id)
  const { loading: loadingClicks, data: clicks, fn: fnClicks } = useFetch(
    getClicksForUrls,
    urls?.map((u) => u.id)
  )

  useEffect(() => { fnUrls() }, [])

  useEffect(() => {
    if (urls?.length) fnClicks()
  }, [urls?.length])

  const totalClicks = clicks?.length || 0
  const avgClicks = urls?.length ? Math.round(totalClicks / urls.length) : 0

  const clicksPerUrl = useMemo(() => {
    if (!clicks || !urls) return {}
    return clicks.reduce((acc, c) => {
      acc[c.url_id] = (acc[c.url_id] || 0) + 1
      return acc
    }, {})
  }, [clicks])

  const filtered = useMemo(() => {
    if (!urls) return []
    const s = q.trim().toLowerCase()
    if (!s) return urls
    return urls.filter(
      (u) =>
        u.title.toLowerCase().includes(s) ||
        (u.short_url || '').toLowerCase().includes(s) ||
        (u.custom_url || '').toLowerCase().includes(s) ||
        (u.original_url || '').toLowerCase().includes(s)
    )
  }, [urls, q])

  const handleDelete = async (url) => {
    if (!confirm(`Delete "${url.title}"? This can't be undone.`)) return
    try {
      await deleteUrl({ id: url.id, user_id: user?.id })
      toast?.('Link deleted', 'danger')
      fnUrls()
    } catch (err) {
      toast?.(err.message || 'Failed to delete', 'danger')
    }
  }

  return (
    <div className="wrap" style={{ maxWidth: 1280, padding: '36px 24px 80px' }}>
      {/* header */}
      <div
        className="dash-head row"
        style={{
          justifyContent: 'space-between',
          gap: 18,
          flexWrap: 'wrap',
          marginBottom: 26,
        }}
      >
        <div className="col" style={{ gap: 5 }}>
          <h1 style={{ fontSize: 26 }}>Hey {(user?.user_metadata?.name || user?.email || '').split(' ')[0]}</h1>
          <p style={{ color: 'var(--ink-2)', fontSize: 15 }}>
            Here&apos;s how your links are performing.
          </p>
        </div>
        <Suspense fallback={null}><CreateLink fetchUrls={fnUrls} /></Suspense>
      </div>

      {/* stats */}
      <div
        className="stat-grid"
        style={{ display: 'flex', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}
      >
        <StatCard
          icon="link"
          label="Total links"
          value={urls?.length || 0}
          color="var(--primary)"
          soft="var(--primary-soft)"
          loading={loading}
        />
        <StatCard
          icon="cursor"
          label="Total clicks"
          value={totalClicks}
          color="var(--violet)"
          soft="var(--violet-soft)"
          loading={loadingClicks}
        />
        <StatCard
          icon="chart"
          label="Avg. clicks / link"
          value={avgClicks}
          color="var(--teal)"
          soft="color-mix(in srgb,var(--teal) 14%,transparent)"
          loading={loading || loadingClicks}
        />
      </div>

      {/* list header + search */}
      <div
        className="row"
        style={{ justifyContent: 'space-between', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}
      >
        <h2 style={{ fontSize: 20 }}>
          Your links{' '}
          {!loading && (
            <span
              style={{ color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 500 }}
            >
              ({urls?.length || 0})
            </span>
          )}
        </h2>
        <div className="input-shell" style={{ height: 44, maxWidth: 300, width: '100%' }}>
          <span className="lead-icon">
            <Icon name="search" size={17} />
          </span>
          <input
            placeholder="Filter by title…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          {q && (
            <button
              className="lead-icon"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              onClick={() => setQ('')}
            >
              <Icon name="x" size={16} />
            </button>
          )}
        </div>
      </div>

      {/* list */}
      {loading ? (
        <div className="col" style={{ gap: 12 }}>
          {[0, 1, 2, 3].map((i) => (
            <LinkRowSkeleton key={i} />
          ))}
        </div>
      ) : !urls?.length ? (
        <EmptyState onCreate={() => router.push('/dashboard?createNew=true')} />
      ) : filtered.length === 0 ? (
        <div
          className="card"
          style={{ padding: '52px 24px', textAlign: 'center', color: 'var(--ink-2)' }}
        >
          <Icon name="search" size={30} style={{ color: 'var(--ink-3)', marginBottom: 10 }} />
          <p style={{ fontWeight: 600, fontSize: 16 }}>No links match &ldquo;{q}&rdquo;</p>
          <p style={{ fontSize: 14, color: 'var(--ink-3)', marginTop: 4 }}>
            Try a different title or alias.
          </p>
        </div>
      ) : (
        <div className="col stagger" style={{ gap: 12 }}>
          {filtered.map((url) => (
            <LinkRow
              key={url.id}
              url={url}
              clicks={clicksPerUrl[url.id] || 0}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
