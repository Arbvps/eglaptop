import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

async function checkAdmin(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase.from("user_profiles").select("role").eq("id", user.id).single()
  if (!profile || !["super_admin", "admin"].includes(profile.role)) return null
  return user
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const admin = await checkAdmin(supabase)
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await params
  const body = await request.json()
  const updates: Record<string, any> = { updated_at: new Date().toISOString() }

  if (body.fullName !== undefined) updates.full_name = body.fullName
  if (body.role !== undefined) updates.role = body.role
  if (body.teamMemberName !== undefined) updates.team_member_name = body.teamMemberName || null
  if (body.phone !== undefined) updates.phone = body.phone || null
  if (body.isActive !== undefined) updates.is_active = body.isActive

  const { error } = await supabase.from("user_profiles").update(updates).eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  const action = body.isActive !== undefined
    ? (body.isActive ? "activate_user" : "deactivate_user")
    : "update_user"
  await supabase.from("activity_logs").insert({
    user_id: admin.id,
    action,
    details: `تحديث بيانات المستخدم: ${id}`,
    target_user_id: id,
  })

  return NextResponse.json({ success: true })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const admin = await checkAdmin(supabase)
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await params

  // Don't allow self-deletion
  if (admin.id === id) return NextResponse.json({ error: "لا يمكنك حذف حسابك الخاص" }, { status: 400 })

  const { error } = await supabase.auth.admin.deleteUser(id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  await supabase.from("activity_logs").insert({
    user_id: admin.id,
    action: "delete_user",
    details: `حذف المستخدم: ${id}`,
    target_user_id: id,
  })

  return NextResponse.json({ success: true })
}
