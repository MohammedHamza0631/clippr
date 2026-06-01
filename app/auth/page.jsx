'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useRef, useState } from 'react'
import { Btn, Field, Icon, Logo } from '@/components/ds'
import Image from 'next/image'
import { UrlState } from '@/context/url-provider'
import { login, signup } from '@/db/apiAuth'
import useFetch from '@/hooks/use-fetch'
import { QR_PLACEHOLDER_URL } from '@/lib/constants'

/* ---- Mini sparkline for brand panel ---- */
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
        stroke="rgba(255,255,255,.7)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={w} cy={h - (pts[pts.length - 1] / max) * h} r="3.5" fill="#fff" />
    </svg>
  )
}

const FRIENDLY_AUTH_ERROR = [
  /too many/i,
  /invalid.*credential/i,
  /already registered/i,
  /email.*taken/i,
  /user.*not.*found/i,
  /password.*\d/i,
  /profile picture/i,
  /please try again/i,
  /check.*email/i,
  /confirm.*email/i,
  /email.*invalid/i,
  /weak password/i,
]

function sanitizeAuthError(msg) {
  if (!msg) return 'Something went wrong. Please try again.'
  if (FRIENDLY_AUTH_ERROR.some((rx) => rx.test(msg))) return msg
  return 'Something went wrong. Please try again.'
}

/* ---- Auth page content (uses useSearchParams, wrapped in Suspense) ---- */
function AuthPageContent() {
  const searchParams = useSearchParams()
  const longLink = searchParams?.get('createNew')
  const defaultTab = searchParams?.get('tab') === 'signup' ? 'signup' : 'login'
  const router = useRouter()
  const { isAuthenticated, loading: authLoading, fetchUser } = UrlState()
  const fileRef = useRef(null)

  const [tab, setTab] = useState(defaultTab)
  const isSignup = tab === 'signup'

  /* form state */
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [avatarFile, setAvatarFile] = useState(null)   // File object for upload
  const [avatarPreview, setAvatarPreview] = useState(null) // data URL for display
  const [errors, setErrors] = useState({})
  const [formErr, setFormErr] = useState('')

  /* data hooks */
  const { loading: loggingIn, error: loginError, fn: fnLogin, data: loginData } = useFetch(login, { email, password: pw })
  const { loading: signingUp, error: signupError, fn: fnSignup, data: signupData } = useFetch(signup, { name, email, password: pw, profile_pic: avatarFile })
  const loading = isSignup ? signingUp : loggingIn

  /* redirect when already authed */
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      router.push(`/dashboard${longLink ? `?createNew=${encodeURIComponent(longLink)}` : ''}`)
    }
  }, [isAuthenticated, authLoading])

  /* handle login success */
  useEffect(() => {
    if (loginData && loginError === null) {
      fetchUser()
      router.push(`/dashboard${longLink ? `?createNew=${encodeURIComponent(longLink)}` : ''}`)
    }
    if (loginError) setFormErr(sanitizeAuthError(loginError.message))
  }, [loginData, loginError])

  /* handle signup success */
  useEffect(() => {
    if (signupData && signupError === null) {
      fetchUser()
      router.push(`/dashboard${longLink ? `?createNew=${encodeURIComponent(longLink)}` : ''}`)
    }
    if (signupError) setFormErr(sanitizeAuthError(signupError.message))
  }, [signupData, signupError])

  const switchTab = (t) => {
    setTab(t)
    setErrors({})
    setFormErr('')
  }

  const onFile = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    setAvatarFile(f)
    const reader = new FileReader()
    reader.onload = () => setAvatarPreview(reader.result)
    reader.readAsDataURL(f)
  }

  const validate = () => {
    const er = {}
    if (isSignup && name.trim().length < 2) er.name = 'Please enter your name'
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) er.email = 'Enter a valid email address'
    if (pw.length < 6) er.pw = 'Password must be at least 6 characters'
    setErrors(er)
    return Object.keys(er).length === 0
  }

  const submit = async (e) => {
    e.preventDefault()
    setFormErr('')
    if (!validate()) return
    if (isSignup) {
      await fnSignup()
    } else {
      await fnLogin()
    }
  }

  return (
    <div
      className="auth-wrap"
      style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 'calc(100vh - 68px)' }}
    >
      {/* left: form */}
      <div
        className="auth-form-col"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 24px',
        }}
      >
        <div className="col anim-up" style={{ gap: 22, width: '100%', maxWidth: 408 }}>
          <div className="col" style={{ gap: 9 }}>
            <h1 style={{ fontSize: 28 }}>
              {isSignup ? 'Create your account' : 'Welcome back'}
            </h1>
            <p style={{ color: 'var(--ink-2)', fontSize: 15 }}>
              {isSignup
                ? 'Start shortening links with analytics in under a minute.'
                : 'Log in to your dashboard and links.'}
            </p>
          </div>

          {/* pending URL banner */}
          {longLink && (
            <div
              style={{
                display: 'flex',
                gap: 11,
                padding: '13px 15px',
                background: 'var(--primary-soft)',
                border: '1px solid var(--primary-line)',
                borderRadius: 'var(--r-md)',
              }}
            >
              <Icon
                name="link"
                size={18}
                style={{ color: 'var(--primary-2)', flex: 'none', marginTop: 1 }}
              />
              <div className="col" style={{ gap: 2, minWidth: 0 }}>
                <span style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--primary-2)' }}>
                  Your link is waiting
                </span>
                <span
                  className="mono"
                  style={{
                    fontSize: 12.5,
                    color: 'var(--ink-2)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {longLink}
                </span>
              </div>
            </div>
          )}

          {/* tabs */}
          <div className="seg" style={{ width: '100%' }}>
            <button
              className={!isSignup ? 'on' : ''}
              style={{ flex: 1, justifyContent: 'center' }}
              onClick={() => switchTab('login')}
            >
              Log in
            </button>
            <button
              className={isSignup ? 'on' : ''}
              style={{ flex: 1, justifyContent: 'center' }}
              onClick={() => switchTab('signup')}
            >
              Sign up
            </button>
          </div>

          <form className="col" style={{ gap: 16 }} onSubmit={submit} noValidate>
            {formErr && (
              <div className="form-error">
                <Icon name="alert" size={18} /> {formErr}
              </div>
            )}

            {isSignup && (
              <>
                <div className="row" style={{ gap: 14, alignItems: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 12,
                      flex: 'none',
                      border: '1.5px dashed var(--border-2)',
                      background: 'var(--surface-2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      overflow: 'hidden',
                      color: 'var(--ink-3)',
                      padding: 0,
                    }}
                    aria-label="upload profile picture"
                  >
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="avatar"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <Icon name="image" size={22} />
                    )}
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    onChange={onFile}
                    style={{ display: 'none' }}
                  />
                  <div className="field" style={{ flex: 1 }}>
                    <Field
                      label="Name"
                      leadIcon="user"
                      placeholder="Your full name"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value)
                        setErrors((x) => ({ ...x, name: '' }))
                      }}
                      error={errors.name}
                    />
                  </div>
                </div>
                {!avatarPreview && (
                  <span style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: -8 }}>
                    Tap the square to add a profile picture (optional)
                  </span>
                )}
              </>
            )}

            <Field
              label="Email"
              type="email"
              leadIcon="mail"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setErrors((x) => ({ ...x, email: '' }))
              }}
              error={errors.email}
              autoComplete="email"
            />
            <Field
              label="Password"
              type="password"
              leadIcon="lock"
              placeholder={isSignup ? 'At least 6 characters' : '••••••••'}
              value={pw}
              onChange={(e) => {
                setPw(e.target.value)
                setErrors((x) => ({ ...x, pw: '' }))
              }}
              error={errors.pw}
              autoComplete={isSignup ? 'new-password' : 'current-password'}
            />

            <Btn
              type="submit"
              size="lg"
              className="btn-block"
              loading={loading}
              iconRight={loading ? undefined : 'arrowRight'}
            >
              {loading
                ? isSignup
                  ? 'Creating account…'
                  : 'Logging in…'
                : isSignup
                ? 'Create account'
                : 'Log in'}
            </Btn>
          </form>

          <p style={{ fontSize: 14, color: 'var(--ink-2)', textAlign: 'center' }}>
            {isSignup ? 'Already have an account? ' : "Don't have an account? "}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault()
                switchTab(isSignup ? 'login' : 'signup')
              }}
              style={{ color: 'var(--primary-2)', fontWeight: 700 }}
            >
              {isSignup ? 'Log in' : 'Sign up free'}
            </a>
          </p>
        </div>
      </div>

      {/* right: brand panel */}
      <div
        className="auth-brand-col"
        style={{
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(150deg,#101010,#141414 50%,#0a0a0a)',
          padding: 48,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-20%',
            right: '-15%',
            width: 480,
            height: 480,
            background: 'radial-gradient(circle,rgba(24,163,92,.34),transparent 62%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-25%',
            left: '-10%',
            width: 420,
            height: 420,
            background: 'radial-gradient(circle,rgba(14,138,80,.24),transparent 62%)',
          }}
        />

        <Logo size={32} light href="/" />

        <div className="col" style={{ gap: 26, position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: 'clamp(24px,2.8vw,34px)', color: '#fff', lineHeight: 1.1 }}>
            Every link you make,
            <br />
            measured the moment
            <br />
            it&apos;s clicked.
          </h2>
          {/* mini result card */}
          <div
            className="card"
            style={{
              padding: 20,
              maxWidth: 320,
              boxShadow: 'var(--shadow-lg)',
              background: 'rgba(255,255,255,.04)',
              border: '1px solid rgba(255,255,255,.08)',
            }}
          >
            <div className="row" style={{ gap: 14 }}>
              <div
                className="qr-card"
                style={{
                  padding: 6,
                  width: 70,
                  height: 70,
                  flex: 'none',
                  background: '#fff',
                }}
              >
                <Image
                  src={QR_PLACEHOLDER_URL}
                  width={58}
                  height={58}
                  alt="QR code"
                  style={{ borderRadius: 3, display: 'block' }}
                />
              </div>
              <div className="col" style={{ gap: 6, minWidth: 0, flex: 1 }}>
                <span
                  className="badge"
                  style={{
                    background: 'rgba(24,163,92,.2)',
                    color: '#3bd488',
                    width: 'fit-content',
                  }}
                >
                  <span className="dot" style={{ background: '#3bd488' }} /> live
                </span>
                <span
                  className="mono"
                  style={{ fontWeight: 600, fontSize: 14, color: '#3bd488' }}
                >
                  clippr.to/spring26
                </span>
              </div>
            </div>
            <div
              style={{ height: 1, background: 'rgba(255,255,255,.08)', margin: '14px 0' }}
            />
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <div className="col">
                <span style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>4,820</span>
                <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,.4)', fontWeight: 600 }}>
                  total clicks
                </span>
              </div>
              <MiniSpark />
            </div>
          </div>
        </div>

        <div
          className="row"
          style={{
            gap: 26,
            position: 'relative',
            zIndex: 1,
            flexWrap: 'wrap',
          }}
        >
          {[
            ['2.4M', 'links'],
            ['184M', 'clicks tracked'],
            ['4.9/5', 'rated'],
          ].map(([v, l]) => (
            <div key={l} className="col">
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 26,
                  fontWeight: 700,
                  color: '#fff',
                }}
              >
                {v}
              </span>
              <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,.6)', fontWeight: 600 }}>
                {l}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense>
      <AuthPageContent />
    </Suspense>
  )
}
