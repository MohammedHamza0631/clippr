import supabase, { supabaseUrl } from "./supabase";
import { rateLimit, getIdentifier } from "./rate-limiter";

// Rate limit configuration
const AUTH_LIMIT = 5; // 5 attempts
const AUTH_DURATION = 300; // 5 minutes
const GENERAL_LIMIT = 100; // 100 requests
const GENERAL_DURATION = 60; // 1 minute

export async function login({ email, password }, req) {
  // Check rate limit for login attempts
  const identifier = getIdentifier(req);
  const rateLimitResult = await rateLimit(
    `login:${identifier}`,
    AUTH_LIMIT,
    AUTH_DURATION
  );

  if (!rateLimitResult.success) {
    throw new Error(
      `Too many login attempts. Please try again in ${Math.ceil(
        (rateLimitResult.reset - Date.now()) / 1000
      )} seconds.`
    );
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw new Error(error.message);

  return data;
}

export async function signup({ name, email, password, profile_pic }, req) {
  // Check rate limit for signup attempts
  const identifier = getIdentifier(req);
  const rateLimitResult = await rateLimit(
    `signup:${identifier}`,
    AUTH_LIMIT,
    AUTH_DURATION
  );

  if (!rateLimitResult.success) {
    throw new Error(
      `Too many signup attempts. Please try again in ${Math.ceil(
        (rateLimitResult.reset - Date.now()) / 1000
      )} seconds.`
    );
  }

  let profile_pic_url = null;
  if (profile_pic) {
    const fileName = `dp-${name.split(" ").join("-")}-${Math.random()}`;

    const { error: storageError } = await supabase.storage
      .from("profile_pic")
      .upload(fileName, profile_pic);

    if (storageError) throw new Error(storageError.message);

    profile_pic_url = `${supabaseUrl}/storage/v1/object/public/profile_pic/${fileName}`;
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
  });

  if (error) throw new Error(error.message);

  return data;
}

export async function getCurrentUser(req) {
  // Check general rate limit
  const identifier = getIdentifier(req);
  const rateLimitResult = await rateLimit(
    `general:${identifier}`,
    GENERAL_LIMIT,
    GENERAL_DURATION
  );

  if (!rateLimitResult.success) {
    throw new Error(
      `Rate limit exceeded. Please try again in ${Math.ceil(
        (rateLimitResult.reset - Date.now()) / 1000
      )} seconds.`
    );
  }

  const { data: session, error } = await supabase.auth.getSession();
  if (!session.session) return null;

  if (error) throw new Error(error.message);
  return session.session?.user;
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}

export async function forgotPassword(email, req) {
  // Check rate limit for password reset attempts
  const identifier = getIdentifier(req);
  const rateLimitResult = await rateLimit(
    `forgot-password:${identifier}`,
    AUTH_LIMIT,
    AUTH_DURATION
  );

  if (!rateLimitResult.success) {
    throw new Error(
      `Too many password reset attempts. Please try again in ${Math.ceil(
        (rateLimitResult.reset - Date.now()) / 1000
      )} seconds.`
    );
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw new Error(error.message);
}
