import { NextRequest, NextResponse } from 'next/server'

interface SendMessageRequest {
  phone_number: string
  message_text: string
  message_id: string
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as SendMessageRequest
    const { phone_number, message_text, message_id } = body

    console.log('[v0] Sending WhatsApp message to', phone_number)

    // Send via WhatsApp Cloud API
    const response = await fetch(
      `https://graph.instagram.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: phone_number,
          type: 'text',
          text: {
            body: message_text,
          },
        }),
      }
    )

    if (!response.ok) {
      throw new Error(`WhatsApp API error: ${response.statusText}`)
    }

    const result = await response.json()
    console.log('[v0] Message sent successfully:', result)

    // Save sent message to database
    await saveWhatsAppMessage({
      phone_number,
      message_text,
      message_id,
      message_type: 'outgoing',
      timestamp: new Date(),
    })

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('[v0] Error sending WhatsApp message:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}

async function saveWhatsAppMessage(data: any) {
  console.log('[v0] Saving outgoing message:', data)
}
