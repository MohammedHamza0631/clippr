import { createClient } from '@supabase/supabase-js'

// Service-role client — bypasses RLS. Server-side ONLY.
// Never import this in any file under app/ that has 'use client',
// or in components/. Only route handlers and server actions.
let _admin = null

function getAdmin() {
  if (!_admin) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY')
    _admin = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  }
  return _admin
}

const supabaseAdmin = new Proxy(
  {},
  {
    get(_, prop) {
      const client = getAdmin()
      const val = client[prop]
      return typeof val === 'function' ? val.bind(client) : val
    },
  }
)

export default supabaseAdmin
