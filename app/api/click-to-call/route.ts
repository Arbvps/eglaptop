import { NextRequest, NextResponse } from 'next/server'

// This endpoint can be used to initiate calls via Issabel AMI or other PBX systems
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { phoneNumber, extension, leadId, employeeName } = body

  if (!phoneNumber || !extension) {
    return NextResponse.json({ error: 'Phone number and extension are required' }, { status: 400 })
  }

  // In production, this would connect to Issabel AMI (Asterisk Manager Interface)
  // Example AMI action to originate a call:
  /*
  const amiConfig = {
    host: process.env.ISSABEL_HOST,
    port: process.env.ISSABEL_AMI_PORT || 5038,
    username: process.env.ISSABEL_AMI_USER,
    password: process.env.ISSABEL_AMI_PASSWORD
  }

  const originateAction = {
    Action: 'Originate',
    Channel: `SIP/${extension}`,
    Context: 'from-internal',
    Exten: phoneNumber,
    Priority: 1,
    CallerID: `TAVOC <${extension}>`,
    Timeout: 30000,
    Async: true
  }
  */

  // For now, return a mock response
  // In production, integrate with actual Issabel/Asterisk AMI
  console.log(`[v0] Click-to-call initiated: ${employeeName} calling ${phoneNumber} from ext ${extension}`)

  return NextResponse.json({
    success: true,
    message: `Initiating call to ${phoneNumber}`,
    callId: `call_${Date.now()}`,
    // In production, return actual call tracking info
    meta: {
      leadId,
      employeeName,
      phoneNumber,
      extension,
      timestamp: new Date().toISOString()
    }
  })
}

// Webhook endpoint for Issabel to report call events
export async function PUT(request: NextRequest) {
  const body = await request.json()
  const { event, callId, duration, status, recording } = body

  // Log call events for analytics
  console.log(`[v0] Call event: ${event}`, { callId, duration, status })

  // In production, update call_logs table with call result
  /*
  const supabase = await createServerClient()
  await supabase.from('call_events').insert({
    call_id: callId,
    event_type: event,
    duration,
    status,
    recording_url: recording,
    timestamp: new Date().toISOString()
  })
  */

  return NextResponse.json({ received: true })
}
