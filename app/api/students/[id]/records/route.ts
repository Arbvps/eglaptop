import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params
  const body = await req.json()

  if (body.action === "transaction") {
    const { data: student } = await supabase.from("students").select("paid_amount").eq("id", id).single()
    const currentPaid = Number(student?.paid_amount ?? 0)
    const newPaid = body.type === "payment" ? currentPaid + Number(body.amount) : currentPaid

    const { data: tx, error: txErr } = await supabase
      .from("transactions")
      .insert([{
        student_id: id,
        amount: body.amount,
        type: body.type,
        description: body.description,
        date: body.date ?? new Date().toISOString().split("T")[0],
        status: body.status,
      }])
      .select()
      .single()
    if (txErr) return NextResponse.json({ error: txErr.message }, { status: 500 })

    await supabase.from("students").update({ paid_amount: newPaid }).eq("id", id)
    return NextResponse.json(tx)
  }

  if (body.action === "attendance") {
    const { data, error } = await supabase
      .from("attendance")
      .insert([{
        student_id: id,
        session_date: body.sessionDate,
        session_title: body.sessionTitle,
        lecturer: body.lecturer,
        status: body.status,
        notes: body.notes || null,
      }])
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 })
}

