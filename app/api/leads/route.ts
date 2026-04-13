import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()
  const { data: leads, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const [fbRes, fuRes] = await Promise.all([
    supabase.from("feedback").select("*").order("date", { ascending: true }),
    supabase.from("follow_ups").select("*").order("scheduled_date", { ascending: true }),
  ])

  const feedback = fbRes.data ?? []
  const followUps = fuRes.data ?? []

  const result = (leads ?? []).map((l) => ({
    ...l,
    feedback: feedback.filter((f) => f.lead_id === l.id),
    follow_ups: followUps.filter((f) => f.lead_id === l.id),
  }))

  return NextResponse.json(result)
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const body = await req.json()
  const { data, error } = await supabase.from("leads").insert(body).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ...data, feedback: [], follow_ups: [] })
}
