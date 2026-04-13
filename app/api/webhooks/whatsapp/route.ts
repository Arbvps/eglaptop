import { NextRequest, NextResponse } from 'next/server'

const WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'tavoc_whatsapp_webhook_2026'

// Handle WhatsApp webhook verification
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === WHATSAPP_VERIFY_TOKEN && challenge) {
    console.log('[v0] WhatsApp webhook verified')
    return new NextResponse(challenge)
  }

  return new NextResponse('Forbidden', { status: 403 })
}

// Handle incoming WhatsApp messages
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    console.log('[v0] WhatsApp webhook received:', data)

    // Extract message details
    if (data.entry?.[0]?.changes?.[0]?.value?.messages) {
      const messages = data.entry[0].changes[0].value.messages
      const contacts = data.entry[0].changes[0].value.contacts

      for (const message of messages) {
        const phoneNumber = message.from
        const messageId = message.id
        const timestamp = message.timestamp
        const text = message.text?.body || ''
        const contactName = contacts?.[0]?.profile?.name || 'Unknown'

        console.log('[v0] New WhatsApp message from', phoneNumber, ':', text)

        // Save message to database
        await saveWhatsAppMessage({
          phone_number: phoneNumber,
          contact_name: contactName,
          message_id: messageId,
          message_text: text,
          message_type: 'incoming',
          timestamp: new Date(parseInt(timestamp) * 1000),
        })

        // Generate AI suggestion
        const aiResponse = await generateAISuggestion(text, contactName, phoneNumber)

        // Save AI suggestion for manual review
        await savePendingReview({
          phone_number: phoneNumber,
          contact_name: contactName,
          incoming_message: text,
          ai_suggestion: aiResponse,
          status: 'pending',
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] WhatsApp webhook error:', error)
    return NextResponse.json({ error: 'Failed to process webhook' }, { status: 500 })
  }
}

async function saveWhatsAppMessage(data: any) {
  // Save to database - using in-memory storage for demo
  console.log('[v0] Saving WhatsApp message:', data)
  // In production, connect to Supabase/database
}

async function generateAISuggestion(message: string, contactName: string, phoneNumber: string): Promise<string> {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        system: `You are a professional customer service representative for an Arabic media training company (TAVOC - The Arabic Voice Over Company). 
        
The customer just sent a message. Generate a professional, friendly response in Arabic (Egyptian dialect if possible) that addresses their message and encourages them to learn more about the company's voice-over training programs.

Keep the response concise (2-3 sentences max) and helpful.`,
        messages: [
          {
            role: 'user',
            content: `Customer message: "${message}"\nCustomer name: ${contactName}\nPhone: ${phoneNumber}`,
          },
        ],
      }),
    })

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.statusText}`)
    }

    const result = await response.json()
    const suggestion = result.content?.[0]?.text || 'Unable to generate response'
    console.log('[v0] AI suggestion generated:', suggestion)
    return suggestion
  } catch (error) {
    console.error('[v0] Claude API error:', error)
    return 'شكراً لتواصلك معنا. سيتواصل معك فريقنا قريباً للإجابة على استفسارك.'
  }
}

async function savePendingReview(data: any) {
  console.log('[v0] Saving pending review:', data)
  // Save to database for manual review in dashboard
}
