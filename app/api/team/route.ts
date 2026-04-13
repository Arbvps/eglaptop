import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()

  // Get team members + sum their sales from sales table
  const [teamRes, salesRes] = await Promise.all([
    supabase.from("team_members").select("*").order("name"),
    supabase.from("sales").select("salesperson, amount"),
  ])

  if (teamRes.error) return NextResponse.json({ error: teamRes.error.message }, { status: 500 })

  const salesData = salesRes.data ?? []
  const team = (teamRes.data ?? []).map((m) => {
    const salesTotal = salesData.filter((s) => s.salesperson === m.name).reduce((sum, s) => sum + Number(s.amount), 0)
    const deals = salesData.filter((s) => s.salesperson === m.name).length
    return { ...m, sales: salesTotal, deals }
  })

  return NextResponse.json(team)
}

export async function PATCH(req: Request) {
  const supabase = await createClient()
  const body = await req.json()
  const updates: Record<string, unknown> = {}
  if ("attendanceDays" in body) updates.attendance_days = body.attendanceDays
  if ("target" in body) updates.target = body.target
  if ("role" in body) updates.role = body.role
  const { data, error } = await supabase
    .from("team_members")
    .update(updates)
    .eq("name", body.name)
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
