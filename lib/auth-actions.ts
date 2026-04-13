"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export async function login(formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  })
  if (error) return { error: error.message }

  // Update last_login timestamp
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    await supabase
      .from("user_profiles")
      .update({ last_login: new Date().toISOString() })
      .eq("id", user.id)
    await supabase.from("activity_logs").insert({
      user_id: user.id,
      action: "login",
      details: "تسجيل دخول ناجح",
    })
  }

  revalidatePath("/", "layout")
  redirect("/")
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath("/", "layout")
  redirect("/login")
}

export async function createUserAction(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const fullName = formData.get("fullName") as string
  const role = formData.get("role") as string
  const teamMemberName = formData.get("teamMemberName") as string

  // Create auth user via admin (requires service role - will use regular signup here)
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, role, team_member_name: teamMemberName },
  })
  if (error) return { error: error.message }

  // Insert profile
  const { error: profileError } = await supabase.from("user_profiles").insert({
    id: data.user.id,
    email,
    full_name: fullName,
    role,
    team_member_name: teamMemberName || null,
    is_active: true,
  })
  if (profileError) return { error: profileError.message }
  return { success: true }
}

export async function updateUserRoleAction(userId: string, role: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("user_profiles")
    .update({ role, updated_at: new Date().toISOString() })
    .eq("id", userId)
  if (error) return { error: error.message }
  return { success: true }
}

export async function toggleUserActiveAction(userId: string, isActive: boolean) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("user_profiles")
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("id", userId)
  if (error) return { error: error.message }
  return { success: true }
}

export async function deleteUserAction(userId: string) {
  const supabase = await createClient()
  const { error } = await supabase.auth.admin.deleteUser(userId)
  if (error) return { error: error.message }
  return { success: true }
}

export async function updatePasswordAction(userId: string, password: string) {
  const supabase = await createClient()
  const { error } = await supabase.auth.admin.updateUserById(userId, { password })
  if (error) return { error: error.message }
  return { success: true }
}

export async function logActivityAction(action: string, details: string, targetUserId?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  await supabase.from("activity_logs").insert({
    user_id: user.id,
    action,
    details,
    target_user_id: targetUserId || null,
    ip_address: null,
  })
}
