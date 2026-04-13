import { NextRequest, NextResponse } from 'next/server'

interface GenerateResponseRequest {
  message: string
  customer_name?: string
  context?: string
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as GenerateResponseRequest
    const { message, customer_name = 'العميل', context = '' } = body

    console.log('[v0] Generating AI response for message:', message)

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        system: `You are a professional customer service representative for TAVOC (The Arabic Voice Over Company) - a leading media training and voice-over company in the Middle East since 2009.

Your role:
- Respond professionally and warmly to customer inquiries
- Provide information about voice-over training programs, dubbing, podcasting, and media production services
- Encourage customers to join training courses and programs
- Use Egyptian Arabic dialect when appropriate for a natural, conversational tone
- Keep responses concise (2-3 sentences) unless more details are requested
- Always be helpful and positive

Company info:
- Established: 2009
- Headquarters: Cairo, Egypt (4 Shaheed Mahmoud Anwar St, Maadi)
- Branches: Alexandria, Dubai
- Website: www.thearabicvoiceover.com
- Services: Voice-over training, dubbing, podcast production, TV/radio presenting, Arabic language for media professionals
- Main Diploma: Advanced Voice-over Diploma (15,000 EGP)
- Individual Courses: Dubbing, Podcasting, Radio Presenting (5,500-7,500 EGP range)

${context ? `Additional context: ${context}` : ''}`,
        messages: [
          {
            role: 'user',
            content: `Customer "${customer_name}" just sent this message:\n\n"${message}"\n\nGenerate a professional response in Arabic.`,
          },
        ],
      }),
    })

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.statusText}`)
    }

    const result = await response.json()
    const aiResponse = result.content?.[0]?.text || 'Unable to generate response'

    console.log('[v0] AI response generated successfully')

    return NextResponse.json({
      success: true,
      response: aiResponse,
    })
  } catch (error) {
    console.error('[v0] Error generating AI response:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate response',
        fallback: 'شكراً لتواصلك معنا. سيتواصل معك فريقنا قريباً للإجابة على استفسارك.',
      },
      { status: 500 }
    )
  }
}
