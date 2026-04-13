import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { getUserPermissions, updateUserPermissions } from "@/lib/auth"

async function checkAdmin(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase.from("user_profiles").select("role").eq("id", user.id).single()
  if (!profile || !["super_admin", "admin", "manager"].includes(profile.role)) return null
  return user
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const admin = await checkAdmin(supabase)
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await params
  const permissions = await getUserPermissions(id)
  return NextResponse.json({ permissions })
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const admin = await checkAdmin(supabase)
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await params
  const { overrides } = await request.json()
  const result = await updateUserPermissions(id, overrides)

  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 })

  await supabase.from("activity_logs").insert({
    user_id: admin.id,
    action: "update_permissions",
    details: `تحديث صلاحيات المستخدم: ${id} (${overrides.length} تعديل)`,
    target_user_id: id,
  })

  return NextResponse.json({ success: true })
}
