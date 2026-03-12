import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json(
            { error: 'Unauthorized' }, { status: 401 }
        )

        const { subject, body, channel } = await request.json()

        const anthropic = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY!
        })

        const systemPrompt = `You are an expert influencer outreach copywriter. Improve email templates to increase open and reply rates. Keep {variables} intact. Be concise, personal, and compelling.`

        const userPrompt = `Improve this outreach template:
        
Subject: ${subject}

Body:
${body}

Return ONLY valid JSON (no markdown):
{
  "subject": "improved subject",
  "body": "improved body",
  "changes": ["list of what was improved"]
}`

        const message = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 800,
            system: systemPrompt,
            messages: [{
                role: 'user',
                content: userPrompt
            }]
        })

        const text = message.content[0].type === 'text'
            ? message.content[0].text : ''

        const clean = text
            .replace(/```json\n?/g, '')
            .replace(/```\n?/g, '')
            .trim()

        let improved;
        try {
            improved = JSON.parse(clean)
        } catch {
            return NextResponse.json(
                { error: 'Failed to parse AI response' }, { status: 500 }
            )
        }

        return NextResponse.json(improved)

    } catch (error: any) {
        console.error('Improve template error:', error)
        return NextResponse.json(
            { error: error.message }, { status: 500 }
        )
    }
}
