import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// PATCH /api/followups/[id] — toggle done/pending
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params
  const body = await req.json()
  const { data, error } = await supabase.from("follow_ups").update({ status: body.status }).eq("id", id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
