import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('integrations')
    .select('*')
    .single()

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data || {
    issabel_enabled: false,
    issabel_config: {},
    microsip_enabled: false,
    microsip_config: {},
    webhooks: {}
  })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const body = await request.json()

  // Upsert the integration settings
  const { error } = await supabase
    .from('integrations')
    .upsert({
      id: 'main',
      issabel_enabled: body.issabel_enabled,
      issabel_config: body.issabel_config,
      microsip_enabled: body.microsip_enabled,
      microsip_config: body.microsip_config,
      webhooks: body.webhooks,
      updated_at: new Date().toISOString()
    }, { onConflict: 'id' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
