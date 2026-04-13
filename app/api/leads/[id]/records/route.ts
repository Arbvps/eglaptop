import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params
  const body = await req.json()

  if (body.action === "feedback") {
    const { data, error } = await supabase.from("feedback").insert([{
      lead_id: id,
      notes: body.notes,
      sentiment: body.sentiment,
      date: body.date ?? new Date().toISOString().split("T")[0],
    }]).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  if (body.action === "followup") {
    const { data, error } = await supabase.from("follow_ups").insert([{
      lead_id: id,
      scheduled_date: body.scheduledDate,
      notes: body.notes,
      type: body.type,
      status: body.status ?? "pending",
    }]).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 })
}
