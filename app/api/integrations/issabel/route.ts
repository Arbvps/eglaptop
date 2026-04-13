import { NextRequest, NextResponse } from 'next/server'

interface IssabelConfig {
  serverUrl: string
  apiKey: string
  extension: string
  username: string
  password: string
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      action: 'test' | 'sync' | 'dial'
      config?: IssabelConfig
      phone?: string
      lead_id?: string
    }

    const { action, config, phone, lead_id } = body

    if (action === 'test') {
      return testIssabelConnection(config!)
    }

    if (action === 'sync') {
      return syncLeadsWithIssabel(config!, lead_id)
    }

    if (action === 'dial') {
      return initiateAutoDial(config!, phone!)
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('[v0] Issabel API error:', error)
    return NextResponse.json({ error: 'Issabel integration failed' }, { status: 500 })
  }
}

async function testIssabelConnection(config: IssabelConfig) {
  try {
    console.log('[v0] Testing Issabel connection to', config.serverUrl)

    // Test Issabel API connection
    const response = await fetch(`${config.serverUrl}/api/api.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: config.apiKey,
        method: 'getExtension',
        extension: config.extension,
      }),
    })

    if (!response.ok) {
      throw new Error(`Issabel API error: ${response.statusText}`)
    }

    const result = await response.json()
    console.log('[v0] Issabel connection test successful')

    return NextResponse.json({
      success: true,
      message: 'تم الاتصال بـ Issabel بنجاح',
      data: result,
    })
  } catch (error) {
    console.error('[v0] Issabel test error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'فشل الاتصال بـ Issabel',
      },
      { status: 500 }
    )
  }
}

async function syncLeadsWithIssabel(config: IssabelConfig, lead_id?: string) {
  try {
    console.log('[v0] Syncing leads with Issabel')

    // Sync leads data with Issabel CRM
    const response = await fetch(`${config.serverUrl}/api/api.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: config.apiKey,
        method: 'createLead',
        data: {
          lead_id,
          // Additional lead data
        },
      }),
    })

    const result = await response.json()
    console.log('[v0] Leads synced successfully')

    return NextResponse.json({
      success: true,
      message: 'تم مزامنة العملاء مع Issabel بنجاح',
      data: result,
    })
  } catch (error) {
    console.error('[v0] Sync error:', error)
    return NextResponse.json(
      { error: 'فشلت المزامنة مع Issabel' },
      { status: 500 }
    )
  }
}

async function initiateAutoDial(config: IssabelConfig, phone: string) {
  try {
    console.log('[v0] Initiating auto-dial to', phone)

    // Use AutoDialer to initiate call
    const response = await fetch(`${config.serverUrl}/api/api.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: config.apiKey,
        method: 'autoDial',
        phone,
        extension: config.extension,
      }),
    })

    const result = await response.json()
    console.log('[v0] Auto-dial initiated successfully')

    return NextResponse.json({
      success: true,
      message: 'تم بدء المكالمة الآلية بنجاح',
      data: result,
    })
  } catch (error) {
    console.error('[v0] Auto-dial error:', error)
    return NextResponse.json(
      { error: 'فشل بدء المكالمة الآلية' },
      { status: 500 }
    )
  }
}
