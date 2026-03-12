import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!
})

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json(
            { error: 'Unauthorized' }, { status: 401 }
        )

        const { influencer, search_context } = await request.json()

        // Get brand profile
        const { data: brand } = await supabase
            .from('brands')
            .select('*')
            .eq('user_id', user.id)
            .single()

        if (!brand) return NextResponse.json(
            { error: 'Brand not found' }, { status: 404 }
        )

        const message = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 512,
            messages: [{
                role: 'user',
                content: `You are scoring influencer-brand match for
a SPECIFIC search query. Be strict and accurate.

SEARCH: "${search_context?.query}"
NICHE FILTER: "${search_context?.niche || 'any'}"
LOCATION FILTER: "${search_context?.location || 'any'}"

BRAND: ${brand.name} | ${brand.industry}

INFLUENCER:
Handle: ${influencer.handle}
Platform: ${influencer.platform}  
Niche: ${influencer.niche}
City: ${influencer.city}
Followers: ${influencer.followers?.toLocaleString('en-IN')}
Engagement: ${influencer.engagement_rate}%
Bio: ${influencer.bio}
Tags: ${influencer.tags?.join(', ')}

SCORING INSTRUCTIONS (must follow strictly):

Step 1 — Niche match (0-40 points):
Does "${influencer.niche}" match "${search_context?.niche}"?
  - Direct match (fashion=fashion) → 35-40 pts
  - Related match (fashion+beauty) → 20-30 pts  
  - Weak overlap → 10-20 pts
  - No match at all → 0-10 pts

Step 2 — Location match (0-25 points):
Is ${influencer.city} = "${search_context?.location}"?
  - Exact city match → 25 pts
  - Different city → 0 pts
  - No location filter → 20 pts (neutral)

Step 3 — Engagement quality (0-20 points):
Engagement rate ${influencer.engagement_rate}%:
  - Above 6% → 18-20 pts (excellent)
  - 4-6% → 12-17 pts (good)
  - 2-4% → 6-11 pts (average)
  - Below 2% → 0-5 pts (poor)

Step 4 — Audience fit (0-15 points):
Does the influencer's audience match the brand?
Consider: platform, language, follower size

Total score = Step1 + Step2 + Step3 + Step4

IMPORTANT EXAMPLES:
- Sustainable fashion creator in Mumbai 
  for "sustainable fashion Mumbai" search → 85-95
- Beauty creator in Chennai 
  for "sustainable fashion Mumbai" search → 25-40
- Fashion creator in Delhi
  for "sustainable fashion Mumbai" search → 50-65

Return ONLY valid JSON:
{
  "score": [number 0-100],
  "insight": "[1 sentence explaining score referencing the specific search]"
}`
            }]
        })

        const responseText = message.content[0].type === 'text'
            ? message.content[0].text
            : ''

        const cleanJson = responseText
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .trim()

        const result = JSON.parse(cleanJson)

        return NextResponse.json({
            success: true,
            score: result.score,
            insight: result.insight
        })

    } catch (error: any) {
        console.error('Match score error:', error)
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}
