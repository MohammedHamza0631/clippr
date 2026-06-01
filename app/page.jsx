'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Btn, Icon } from '@/components/ds'
import { BarChart, DonutChart } from '@/components/ds-charts'
import Image from 'next/image'
import { BASE_APP_DOMAIN, QR_PLACEHOLDER_URL } from '@/lib/constants'

/* ---- Mini sparkline ---- */
function MiniSpark() {
  const pts = [8, 14, 11, 20, 16, 26, 22, 34, 40]
  const max = Math.max(...pts)
  const w = 120
  const h = 38
  const d = pts.map((p, i) => `${(i / (pts.length - 1)) * w},${h - (p / max) * h}`).join(' ')
  return (
    <svg width={w} height={h} style={{ overflow: 'visible' }}>
      <polyline
        points={d}
        fill="none"
        stroke="var(--violet)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={w}
        cy={h - (pts[pts.length - 1] / max) * h}
        r="3.5"
        fill="var(--violet)"
      />
    </svg>
  )
}

/* ---- Product result card ---- */
function LinkResultCard({ compact }) {
  return (
    <div
      className="card"
      style={{ padding: compact ? 16 : 20, boxShadow: 'var(--shadow-lg)', maxWidth: 380 }}
    >
      <div className="row" style={{ gap: 14 }}>
        <div
          className="qr-card"
          style={{
            padding: 9,
            width: compact ? 76 : 90,
            height: compact ? 76 : 90,
            background: '#f5f5f5',
          }}
        >
          <Image
            src={QR_PLACEHOLDER_URL}
            width={compact ? 58 : 70}
            height={compact ? 58 : 70}
            alt="QR code"
            style={{ borderRadius: 3, display: 'block' }}
          />
        </div>
        <div className="col" style={{ gap: 6, minWidth: 0, flex: 1 }}>
          <span className="badge badge-primary" style={{ width: 'fit-content' }}>
            <span className="dot" style={{ background: 'var(--primary)' }} /> live
          </span>
          <span
            className="mono"
            style={{ fontWeight: 600, fontSize: 15, color: 'var(--primary-2)' }}
          >
            {BASE_APP_DOMAIN}/spring26
          </span>
          <span
            style={{
              fontSize: 12.5,
              color: 'var(--ink-3)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            acme.io/blog/2026/spring-launch…
          </span>
        </div>
      </div>
      <div style={{ height: 1, background: 'var(--border)', margin: '14px 0' }} />
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <div className="col">
          <span
            style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700 }}
          >
            4,820
          </span>
          <span style={{ fontSize: 11.5, color: 'var(--ink-3)', fontWeight: 600 }}>
            total clicks
          </span>
        </div>
        <MiniSpark />
      </div>
    </div>
  )
}

/* ---- Device chip ---- */
function DeviceChip() {
  const devices = [
    { label: 'Mobile', pct: '58%', color: 'var(--primary)' },
    { label: 'Desktop', pct: '31%', color: 'var(--violet)' },
    { label: 'Tablet', pct: '11%', color: 'var(--amber)' },
  ]
  return (
    <div className="card" style={{ padding: '12px 16px', boxShadow: 'var(--shadow-lg)' }}>
      <div className="row" style={{ gap: 14 }}>
        {devices.map((d) => (
          <div key={d.label} className="col center" style={{ gap: 4 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: 99,
                background: d.color,
                display: 'block',
              }}
            />
            <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>
              {d.pct}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---- Hero URL input ---- */
function HeroInput({ onShorten, big }) {
  const [url, setUrl] = useState('')
  const [err, setErr] = useState('')

  const submit = (e) => {
    e.preventDefault()
    if (!url.trim()) {
      setErr('Enter a valid URL to continue')
      return
    }
    try {
      const normalized = url.match(/^https?:\/\//) ? url : 'https://' + url
      new URL(normalized)
      onShorten(normalized)
    } catch {
      setErr('Enter a valid URL to continue')
    }
  }

  return (
    <div className="col" style={{ gap: 9, width: '100%', maxWidth: big ? 560 : 520 }}>
      <form
        onSubmit={submit}
        className="hero-input-row"
        style={{
          display: 'flex',
          gap: 9,
          padding: 8,
          background: 'var(--surface)',
          border: `1.5px solid ${err ? 'var(--danger)' : 'var(--border-2)'}`,
          borderRadius: 'var(--r-lg)',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div className="row grow" style={{ gap: 10, paddingLeft: 12, minWidth: 0 }}>
          <Icon name="link" size={20} style={{ color: 'var(--ink-3)', flex: 'none' }} />
          <input
            value={url}
            onChange={(e) => {
              setUrl(e.target.value)
              setErr('')
            }}
            placeholder="Paste a long URL to shorten…"
            style={{
              border: 'none',
              outline: 'none',
              background: 'transparent',
              width: '100%',
              fontSize: 16,
              fontWeight: 500,
              color: 'var(--ink)',
              minWidth: 0,
            }}
          />
        </div>
        <Btn type="submit" size="lg" iconRight="arrowRight" style={{ flex: 'none' }}>
          <span className="hero-btn-label">Shorten</span>
        </Btn>
      </form>
      {err ? (
        <span className="field-error" style={{ paddingLeft: 6 }}>
          <Icon name="alert" size={14} /> {err}
        </span>
      ) : (
        <span style={{ fontSize: 13, color: 'var(--ink-3)', paddingLeft: 6 }}>
          Free forever · No credit card · QR code included
        </span>
      )}
    </div>
  )
}

/* ---- Hero A (split layout) ---- */
function HeroA({ onShorten }) {
  return (
    <section
      className="wrap hero-a"
      style={{
        display: 'grid',
        gridTemplateColumns: '1.05fr .95fr',
        gap: 56,
        alignItems: 'center',
        padding: '72px 24px 80px',
      }}
    >
      <div className="col anim-up" style={{ gap: 24, alignItems: 'flex-start' }}>
        <span className="badge badge-violet">
          <Icon name="sparkle" size={13} /> Analytics on every link
        </span>
        <h1 style={{ fontSize: 'clamp(30px,3.8vw,48px)' }}>
          Short links that
          <br />
          <span style={{ color: 'var(--primary)' }}>tell you everything.</span>
        </h1>
        <p style={{ fontSize: 17, color: 'var(--ink-2)', lineHeight: 1.55, maxWidth: 460 }}>
          Turn any unwieldy URL into a clean short link with a built-in QR code — then watch the
          clicks roll in by city and device.
        </p>
        <HeroInput onShorten={onShorten} />
      </div>

      <div
        className="hero-a-visual"
        style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}
      >
        <div
          style={{
            position: 'absolute',
            inset: '-8% -4%',
            background: 'radial-gradient(circle at 60% 40%,var(--primary-soft),transparent 65%)',
            filter: 'blur(8px)',
            zIndex: 0,
          }}
        />
        <div
          style={{ position: 'relative', zIndex: 1, animation: 'floatY 5s ease-in-out infinite' }}
        >
          <LinkResultCard />
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: -18,
            left: -14,
            zIndex: 2,
            animation: 'floatY 5s ease-in-out infinite .8s',
          }}
        >
          <DeviceChip />
        </div>
      </div>
    </section>
  )
}

/* ---- Features ---- */
function Features() {
  const feats = [
    {
      icon: 'link',
      tag: 'Shorten',
      color: 'var(--primary)',
      soft: 'var(--primary-soft)',
      title: 'Clean short links',
      body: 'Paste any monster URL and get a tidy, branded short link back in seconds. Add a custom alias when you want it to be memorable.',
    },
    {
      icon: 'qr',
      tag: 'Generate',
      color: 'var(--violet)',
      soft: 'var(--violet-soft)',
      title: 'QR codes, built in',
      body: 'Every link ships with a high-resolution QR code that updates live as you type. Download a print-ready PNG with one tap.',
    },
    {
      icon: 'chart',
      tag: 'Analyze',
      color: 'var(--teal)',
      soft: 'color-mix(in srgb,var(--teal) 14%,transparent)',
      title: 'Clicks that mean something',
      body: 'See total clicks, your top cities, and the device split for every link — recorded silently, the moment someone visits.',
    },
  ]

  return (
    <section id="Features" className="wrap" style={{ padding: '80px 24px' }}>
      <div className="col" style={{ gap: 14, marginBottom: 44, maxWidth: 560 }}>
        <span className="eyebrow">Everything in one tap</span>
        <h2 style={{ fontSize: 'clamp(26px,3.2vw,38px)' }}>Three tools. One short link.</h2>
        <p style={{ fontSize: 16, color: 'var(--ink-2)', lineHeight: 1.55 }}>
          Shorten, generate a QR code, and measure what happens next — without switching tabs.
        </p>
      </div>
      <div
        className="feat-grid"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 22 }}
      >
        {feats.map((f, i) => (
          <div
            key={f.tag}
            className="card"
            style={{
              padding: 26,
              animation: `fadeUp .6s var(--ease) ${i * 0.1}s both`,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 11,
                background: f.soft,
                color: f.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 18,
              }}
            >
              <Icon name={f.icon} size={22} />
            </div>
            <span className="eyebrow" style={{ color: f.color }}>
              {f.tag}
            </span>
            <h3 style={{ fontSize: 20, margin: '8px 0 10px' }}>{f.title}</h3>
            <p style={{ fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.6 }}>{f.body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ---- Analytics showcase ---- */
function AnalyticsShowcase() {
  const cities = [
    { name: 'San Francisco', clicks: 1840 },
    { name: 'New York', clicks: 1310 },
    { name: 'London', clicks: 980 },
    { name: 'Berlin', clicks: 540 },
    { name: 'Tokyo', clicks: 310 },
  ]

  return (
    <section
      id="How%20it%20works"
      style={{
        background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div
        className="wrap analytics-show"
        style={{
          padding: '80px 24px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 56,
          alignItems: 'center',
        }}
      >
        <div className="col" style={{ gap: 18 }}>
          <span className="eyebrow" style={{ color: 'var(--violet)' }}>Real analytics</span>
          <h2 style={{ fontSize: 'clamp(26px,3.2vw,38px)' }}>
            Know exactly where your clicks come from.
          </h2>
          <p style={{ fontSize: 15.5, color: 'var(--ink-2)', lineHeight: 1.6 }}>
            Every visit is recorded the instant someone hits your link. Open any link to see its
            total clicks, a breakdown of the top five cities, and the device mix — mobile, desktop,
            and tablet.
          </p>
          <div className="col" style={{ gap: 10, marginTop: 6 }}>
            {[
              'Silent click tracking — zero setup',
              'City-level geography on a bar chart',
              'Device split on a live donut chart',
            ].map((t) => (
              <div
                key={t}
                className="row"
                style={{ gap: 10, fontSize: 15, fontWeight: 500, color: 'var(--ink)' }}
              >
                <span
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 99,
                    background: 'var(--success-soft)',
                    color: 'var(--success)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flex: 'none',
                  }}
                >
                  <Icon name="check" size={13} />
                </span>
                {t}
              </div>
            ))}
          </div>
        </div>

        <div className="card card-pad" style={{ boxShadow: 'var(--shadow-lg)' }}>
          <div className="row" style={{ justifyContent: 'space-between', marginBottom: 18 }}>
            <span style={{ fontWeight: 700, fontSize: 15 }}>Top cities</span>
            <span className="badge badge-muted">last 30 days</span>
          </div>
          <BarChart data={cities} />
          <div style={{ height: 1, background: 'var(--border)', margin: '22px 0' }} />
          <DonutChart devices={{ mobile: 2410, desktop: 1290, tablet: 460 }} size={150} />
        </div>
      </div>
    </section>
  )
}

/* ---- CTA ---- */
function CtaSection({ onSignup }) {
  return (
    <section id="Pricing" className="wrap" style={{ padding: '84px 24px' }}>
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 'var(--r-xl)',
          padding: 'clamp(36px,5.5vw,64px)',
          background: 'linear-gradient(135deg,#0d0d0d,#121212 55%,#0a0a0a)',
          color: '#fff',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid #222',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-40%',
            right: '-10%',
            width: 420,
            height: 420,
            background: 'radial-gradient(circle,rgba(24,163,92,.42),transparent 60%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-50%',
            left: '-5%',
            width: 380,
            height: 380,
            background: 'radial-gradient(circle,rgba(14,138,80,.26),transparent 60%)',
          }}
        />
        <div
          className="col"
          style={{
            gap: 20,
            position: 'relative',
            zIndex: 1,
            alignItems: 'flex-start',
            maxWidth: 620,
          }}
        >
          <span
            className="badge"
            style={{ background: 'rgba(255,255,255,.1)', color: '#fff' }}
          >
            <Icon name="zap" size={13} /> Start free in seconds
          </span>
          <h2 style={{ fontSize: 'clamp(26px,3.4vw,40px)', color: '#fff' }}>
            Your next link deserves better than a guess.
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,.76)', lineHeight: 1.55 }}>
            Create your free account and shorten your first URL — QR code and analytics included,
            no card required.
          </p>
          <div className="row" style={{ gap: 12, flexWrap: 'wrap' }}>
            <Btn variant="primary" size="lg" iconRight="arrowRight" onClick={onSignup}>
              Create free account
            </Btn>
            <Btn
              size="lg"
              onClick={onSignup}
              style={{
                background: 'rgba(255,255,255,.1)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,.2)',
              }}
            >
              Log in
            </Btn>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---- Landing page ---- */
export default function Home() {
  const router = useRouter()
  const handleShorten = (url) => {
    router.push(`/auth?createNew=${encodeURIComponent(url)}`)
  }
  const handleSignup = () => {
    router.push('/auth?tab=signup')
  }

  return (
    <div className="anim-in">
      <HeroA onShorten={handleShorten} />
      <Features />
      <AnalyticsShowcase />
      <CtaSection onSignup={handleSignup} />
    </div>
  )
}
