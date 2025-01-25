import supabase, { supabaseUrl } from "./supabase";

export async function login({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw new Error(error.message);

  return data;
}

export async function signup({ name, email, password, profile_pic }) {
  let profile_pic_url = null;
  if (profile_pic_url) {
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

export async function getCurrentUser() {
  const { data: session, error } = await supabase.auth.getSession();
  if (!session.session) return null;

  // const {data, error} = await supabase.auth.getUser();

  if (error) throw new Error(error.message);
  return session.session?.user;
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}

export async function forgotPassword(email) {
  const { error } = await supabase.auth.api.resetPasswordForEmail(email);
  if (error) throw new Error(error.message);
}
