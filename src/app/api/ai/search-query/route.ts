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

    const { query } = await request.json()
    if (!query) return NextResponse.json(
      { error: 'Query is required' }, { status: 400 }
    )

    // Get brand context to improve matching
    const { data: brand } = await supabase
      .from('brands')
      .select('industry, niche, target_location, monthly_budget, platforms')
      .eq('user_id', user.id)
      .single()

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `You are a search query parser for Clinch.ai, an influencer marketing platform.

YOUR ONLY JOB: Extract filters from the QUERY TEXT.
Do NOT use brand context to fill in missing fields.
If something is not mentioned in the query → null/[].

QUERY TEXT TO PARSE: "${query}"

Return ONLY this JSON. Nothing else. No markdown.
{
  "keywords": [],
  "niche": null,
  "platforms": [],
  "location": null,
  "min_followers": null,
  "max_followers": null,
  "max_budget_inr": null,
  "languages": [],
  "gender": null,
  "search_intent": ""
}

STRICT RULES — only extract what is IN THE QUERY:

platforms: ONLY if query mentions a platform
  "instagram"/"ig"/"reels"/"insta" → ["instagram"]
  "youtube"/"yt"/"video" → ["youtube"]
  "linkedin" → ["linkedin"]
  NOT mentioned → [] (empty array, NOT null)

location: ONLY if an Indian city is in the query
  Recognise: Mumbai, Delhi, Bangalore, Chennai,
  Hyderabad, Pune, Kolkata, Kochi, Jaipur,
  Ahmedabad, Chandigarh, Lucknow, Surat
  NOT mentioned → null

gender: ONLY if query says "female"/"male"/"women"
  NOT mentioned → null

budget: ONLY if query mentions ₹ amount or "under"
  NOT mentioned → null

followers: ONLY if query says "nano"/"micro"/number
  NOT mentioned → null for BOTH min and max

keywords: extract topic words from query
  "sustainable fashion" → ["sustainable","fashion"]
  "fitness" → ["fitness","health","workout"]
  "food" → ["food","cooking","recipe"]
  "tech" → ["tech","technology","gadgets"]
  "beauty" → ["beauty","skincare","makeup"]

niche: main topic as short phrase
  "sustainable fashion influencers" → "sustainable fashion"
  "fitness creators on YouTube" → "fitness health"
  NOT present → null

search_intent: one sentence describing the search

EXAMPLE:
Query: "Sustainable fashion influencers in Mumbai"
Output:
{
  "keywords": ["sustainable","fashion"],
  "niche": "sustainable fashion",
  "platforms": [],
  "location": "Mumbai",
  "min_followers": null,
  "max_followers": null,
  "max_budget_inr": null,
  "languages": [],
  "gender": null,
  "search_intent": "Find sustainable fashion influencers based in Mumbai"
}

Return ONLY the JSON object. Nothing else.`
      }]
    })

    const responseText = message.content[0].type === 'text'
      ? message.content[0].text
      : ''

    // Clean response and parse JSON
    const cleanJson = responseText
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim()

    const filters = JSON.parse(cleanJson)

    return NextResponse.json({
      success: true,
      filters,
      original_query: query
    })

  } catch (error: any) {
    console.error('Search query parse error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to parse query' },
      { status: 500 }
    )
  }
}
