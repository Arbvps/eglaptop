import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: profile } = await supabase.from("user_profiles").select("role").eq("id", user.id).single()
  if (!profile || !["super_admin", "admin", "manager"].includes(profile.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { data: logs } = await supabase
    .from("activity_logs")
    .select("*, user:user_profiles!user_id(full_name, email)")
    .order("created_at", { ascending: false })
    .limit(200)

  return NextResponse.json({ logs: logs || [] })
}
