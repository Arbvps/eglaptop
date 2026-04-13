import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()

  const { data: students, error } = await supabase
    .from("students")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Fetch transactions + attendance for each student
  const [txRes, attRes] = await Promise.all([
    supabase.from("transactions").select("*").order("date", { ascending: false }),
    supabase.from("attendance").select("*").order("session_date", { ascending: false }),
  ])

  const transactions = txRes.data ?? []
  const attendance = attRes.data ?? []

  const result = (students ?? []).map((s) => ({
    ...s,
    transactions: transactions.filter((t) => t.student_id === s.id),
    attendance: attendance.filter((a) => a.student_id === s.id),
  }))

  return NextResponse.json(result)
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const body = await req.json()
  const { data, error } = await supabase.from("students").insert(body).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
