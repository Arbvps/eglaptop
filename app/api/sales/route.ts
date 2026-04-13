import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('sales')
    .select('*')
    .order('date', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data || [])
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const body = await request.json()

  const { error } = await supabase.from('sales').insert({
    customer_name: body.customer_name,
    course: body.course,
    amount: body.amount,
    quantity: body.quantity,
    salesperson: body.salesperson,
    date: body.date,
    status: body.status,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const body = await request.json()

  const { error } = await supabase.from('sales').delete().eq('id', body.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
