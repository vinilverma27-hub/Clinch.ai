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

        const { influencer } = await request.json()

        const { data: brand } = await supabase
            .from('brands')
            .select('*')
            .eq('user_id', user.id)
            .single()

        const firstName = influencer.full_name
            ?.split(' ')[0] || 'there'

        const anthropic = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY!
        })

        const message = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 800,
            messages: [{
                role: 'user',
                content: `Write a warm influencer outreach email.

BRAND:
Name: ${brand?.name || 'Our Brand'}
Industry: ${brand?.industry || 'lifestyle'}
Goals: ${brand?.campaign_goals?.join(', ') || 'brand awareness'}
Budget: ${brand?.monthly_budget || 'flexible'}

INFLUENCER:
First name: ${firstName}
Handle: ${influencer.handle}
Platform: ${influencer.platform}
Niche: ${influencer.niche || 'content creation'}
City: ${influencer.city}, India
Bio: ${influencer.bio || ''}
Past brands: ${influencer.brand_collabs_past?.join(', ') || 'none listed'}

STRICT RULES:
1. Under 110 words total
2. First line: "Hi ${firstName}!" (exactly this)
3. Second sentence must reference their specific niche/bio naturally
4. Mention brand name exactly once
5. Warm and genuine — NOT corporate or robotic
6. ONE soft question as final sentence
7. NO "I hope this email finds you well"
8. NO mention of follower count or percentages
9. Sign off with brand name only (no "Best," etc.)
10. Use ₹ if mentioning money

Return ONLY valid JSON, no markdown:
{
  "subject": "compelling subject line under 8 words",
  "body": "full email with \\n for line breaks"
}`
            }]
        })

        const text = message.content[0].type === 'text'
            ? message.content[0].text : ''

        const clean = text
            .replace(/```json\n?/g, '')
            .replace(/```\n?/g, '')
            .trim()

        let draft
        try {
            draft = JSON.parse(clean)
        } catch {
            draft = {
                subject: `Collaboration with ${brand?.name || 'Our Brand'}`,
                body: `Hi ${firstName}!\n\nLove your content — it perfectly aligns with what we're building at ${brand?.name || 'Our Brand'}.\n\nWould you be open to a collaboration?\n\n${brand?.name || 'Our Brand'}`
            }
        }

        return NextResponse.json({
            success: true,
            subject: draft.subject,
            body: draft.body
        })

    } catch (error: any) {
        console.error('Outreach draft error:', error)
        return NextResponse.json(
            { error: error.message }, { status: 500 }
        )
    }
}
