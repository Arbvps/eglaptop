import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: profile } = await supabase.from("user_profiles").select("role").eq("id", user.id).single()
  if (!profile || !["super_admin", "admin"].includes(profile.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params
  const { password } = await request.json()

  if (!password || password.length < 8) {
    return NextResponse.json({ error: "كلمة المرور يجب أن تكون 8 أحرف على الأقل" }, { status: 400 })
  }

  const { error } = await supabase.auth.admin.updateUserById(id, { password })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  await supabase.from("activity_logs").insert({
    user_id: user.id,
    action: "reset_password",
    details: `إعادة تعيين كلمة مرور المستخدم: ${id}`,
    target_user_id: id,
  })

  return NextResponse.json({ success: true })
}
