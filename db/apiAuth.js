import {
  ALLOWED_IMAGE_TYPES,
  BUCKET_PROFILE_PICS,
  RATE_AUTH_LIMIT,
  RATE_AUTH_WINDOW,
  RATE_GENERAL_LIMIT,
  RATE_GENERAL_WINDOW,
} from '@/lib/constants'
import { getIdentifier, rateLimit } from './rate-limiter'
import supabase, { supabaseUrl } from './supabase'

export async function login({ email, password }, req) {
  // Check rate limit for login attempts
  const identifier = getIdentifier(req)
  const rateLimitResult = await rateLimit(`login:${identifier}`, RATE_AUTH_LIMIT, RATE_AUTH_WINDOW)

  if (!rateLimitResult.success) {
    throw new Error(
      `Too many login attempts. Please try again in ${Math.ceil(
        (rateLimitResult.reset - Date.now()) / 1000
      )} seconds.`
    )
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw new Error(error.message)

  return data
}

export async function signup({ name, email, password, profile_pic }, req) {
  // Check rate limit for signup attempts
  const identifier = getIdentifier(req)
  const rateLimitResult = await rateLimit(`signup:${identifier}`, RATE_AUTH_LIMIT, RATE_AUTH_WINDOW)

  if (!rateLimitResult.success) {
    throw new Error(
      `Too many signup attempts. Please try again in ${Math.ceil(
        (rateLimitResult.reset - Date.now()) / 1000
      )} seconds.`
    )
  }

  let profile_pic_url = null
  if (profile_pic) {
    if (!ALLOWED_IMAGE_TYPES.includes(profile_pic.type)) {
      throw new Error('Profile picture must be a JPEG, PNG, WebP, or GIF image')
    }

    const fileName = `dp-${name.split(' ').join('-')}-${Math.random()}`

    const { error: storageError } = await supabase.storage
      .from(BUCKET_PROFILE_PICS)
      .upload(fileName, profile_pic, { contentType: profile_pic.type })

    if (storageError) throw new Error('Failed to upload profile picture')

    profile_pic_url = `${supabaseUrl}/storage/v1/object/public/${BUCKET_PROFILE_PICS}/${fileName}`
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        profile_pic: profile_pic_url,
      },
    },
  })

  if (error) throw new Error(error.message)

  return data
}

export async function getCurrentUser(req) {
  // Check general rate limit
  const identifier = getIdentifier(req)
  const rateLimitResult = await rateLimit(`general:${identifier}`, RATE_GENERAL_LIMIT, RATE_GENERAL_WINDOW)

  if (!rateLimitResult.success) {
    throw new Error(
      `Rate limit exceeded. Please try again in ${Math.ceil(
        (rateLimitResult.reset - Date.now()) / 1000
      )} seconds.`
    )
  }

  const { data: session, error } = await supabase.auth.getSession()
  if (!session.session) return null

  if (error) throw new Error(error.message)
  return session.session?.user
}

export async function logout() {
  const { error } = await supabase.auth.signOut()
  if (error) throw new Error(error.message)
}

export async function forgotPassword(email, req) {
  // Check rate limit for password reset attempts
  const identifier = getIdentifier(req)
  const rateLimitResult = await rateLimit(
    `forgot-password:${identifier}`,
    RATE_AUTH_LIMIT,
    RATE_AUTH_WINDOW
  )

  if (!rateLimitResult.success) {
    throw new Error(
      `Too many password reset attempts. Please try again in ${Math.ceil(
        (rateLimitResult.reset - Date.now()) / 1000
      )} seconds.`
    )
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email)
  if (error) throw new Error(error.message)
}
