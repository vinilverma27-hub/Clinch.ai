import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const MOCK_INFLUENCERS = [
  {
    id: '1', external_id: 'ig_priya001',
    platform: 'instagram', handle: '@priyastyle',
    full_name: 'Priya Sharma',
    bio: 'Sustainable fashion lover thrift queen eco style Mumbai',
    city: 'Mumbai', country: 'India',
    language: ['hindi', 'english'],
    followers: 45200, avg_views: 12400,
    avg_likes: 2100, avg_comments: 189,
    engagement_rate: 4.8,
    estimated_cost_min: 8000, estimated_cost_max: 12000,
    is_verified: true,
    niche: 'sustainable fashion',
    gender: 'female',
    tags: ['fashion', 'sustainable', 'thrift', 'style',
      'clothing', 'ootd', 'eco', 'lifestyle', 'outfit']
  },
  {
    id: '2', external_id: 'yt_rahul001',
    platform: 'youtube', handle: '@techrahul',
    full_name: 'Rahul Menon',
    bio: 'Tech reviews tutorials gadgets smartphones Bangalore',
    city: 'Bangalore', country: 'India',
    language: ['english'],
    followers: 128000, avg_views: 34500,
    avg_likes: 4800, avg_comments: 312,
    engagement_rate: 6.2,
    estimated_cost_min: 25000, estimated_cost_max: 40000,
    is_verified: true,
    niche: 'technology gadgets reviews',
    gender: 'male',
    tags: ['tech', 'technology', 'gadgets', 'reviews',
      'smartphones', 'software', 'youtube', 'unboxing']
  },
  {
    id: '3', external_id: 'ig_ananya001',
    platform: 'instagram', handle: '@ananya.creates',
    full_name: 'Ananya Iyer',
    bio: 'Lifestyle beauty skincare content creator Chennai',
    city: 'Chennai', country: 'India',
    language: ['tamil', 'english'],
    followers: 28500, avg_views: 8200,
    avg_likes: 1500, avg_comments: 124,
    engagement_rate: 5.1,
    estimated_cost_min: 6000, estimated_cost_max: 9000,
    is_verified: false,
    niche: 'beauty skincare lifestyle',
    gender: 'female',
    tags: ['beauty', 'skincare', 'lifestyle', 'makeup',
      'fashion', 'style', 'selfcare', 'wellness']
  },
  {
    id: '4', external_id: 'li_vikram001',
    platform: 'linkedin', handle: '@vikram.hr.pro',
    full_name: 'Vikram Desai',
    bio: 'HR thought leader future of work B2B Delhi',
    city: 'Delhi', country: 'India',
    language: ['english', 'hindi'],
    followers: 52000, avg_views: 5800,
    avg_likes: 890, avg_comments: 145,
    engagement_rate: 3.8,
    estimated_cost_min: 15000, estimated_cost_max: 20000,
    is_verified: true,
    niche: 'HR technology B2B',
    gender: 'male',
    tags: ['hr', 'b2b', 'business', 'technology',
      'leadership', 'corporate', 'saas', 'startup']
  },
  {
    id: '5', external_id: 'ig_sneha001',
    platform: 'instagram', handle: '@snehalifestyle',
    full_name: 'Sneha Kapoor',
    bio: 'Fitness wellness healthy living workout Mumbai',
    city: 'Mumbai', country: 'India',
    language: ['hindi', 'english'],
    followers: 18300, avg_views: 5400,
    avg_likes: 1300, avg_comments: 98,
    engagement_rate: 7.2,
    estimated_cost_min: 4000, estimated_cost_max: 7000,
    is_verified: false,
    niche: 'fitness wellness health',
    gender: 'female',
    tags: ['fitness', 'health', 'wellness', 'workout',
      'gym', 'nutrition', 'yoga', 'healthy', 'diet']
  },
  {
    id: '6', external_id: 'yt_arjun001',
    platform: 'youtube', handle: '@arjunfitness',
    full_name: 'Arjun Nair',
    bio: 'Fitness transformation workout gym nutrition Pune',
    city: 'Pune', country: 'India',
    language: ['hindi', 'english'],
    followers: 76000, avg_views: 22100,
    avg_likes: 3400, avg_comments: 267,
    engagement_rate: 4.5,
    estimated_cost_min: 18000, estimated_cost_max: 25000,
    is_verified: true,
    niche: 'fitness health workout',
    gender: 'male',
    tags: ['fitness', 'health', 'gym', 'workout',
      'transformation', 'nutrition', 'bodybuilding']
  },
  {
    id: '7', external_id: 'ig_meera001',
    platform: 'instagram', handle: '@meeracooks',
    full_name: 'Meera Reddy',
    bio: 'Home chef South Indian recipes cooking Hyderabad',
    city: 'Hyderabad', country: 'India',
    language: ['telugu', 'hindi', 'english'],
    followers: 34000, avg_views: 9600,
    avg_likes: 2000, avg_comments: 178,
    engagement_rate: 5.8,
    estimated_cost_min: 7000, estimated_cost_max: 11000,
    is_verified: false,
    niche: 'food cooking recipes',
    gender: 'female',
    tags: ['food', 'cooking', 'recipes', 'chef',
      'foodie', 'indianfood', 'kitchen', 'baking']
  },
  {
    id: '8', external_id: 'ig_divya001',
    platform: 'instagram', handle: '@divyabeauty',
    full_name: 'Divya Menon',
    bio: 'Skincare beauty tips makeup tutorials Kochi Kerala',
    city: 'Kochi', country: 'India',
    language: ['malayalam', 'english'],
    followers: 22000, avg_views: 6700,
    avg_likes: 1400, avg_comments: 112,
    engagement_rate: 6.4,
    estimated_cost_min: 5000, estimated_cost_max: 8000,
    is_verified: false,
    niche: 'beauty skincare makeup',
    gender: 'female',
    tags: ['beauty', 'skincare', 'makeup', 'fashion',
      'selfcare', 'glow', 'cosmetics', 'style']
  },
  {
    id: '9', external_id: 'yt_kabir001',
    platform: 'youtube', handle: '@kabirtech',
    full_name: 'Kabir Singh',
    bio: 'SaaS startup software reviews entrepreneur Delhi',
    city: 'Delhi', country: 'India',
    language: ['hindi', 'english'],
    followers: 92000, avg_views: 28300,
    avg_likes: 3600, avg_comments: 289,
    engagement_rate: 3.9,
    estimated_cost_min: 20000, estimated_cost_max: 30000,
    is_verified: true,
    niche: 'technology SaaS startup',
    gender: 'male',
    tags: ['tech', 'saas', 'startup', 'software',
      'entrepreneur', 'business', 'app', 'reviews']
  },
  {
    id: '10', external_id: 'li_rohan001',
    platform: 'linkedin', handle: '@rohanbiz',
    full_name: 'Rohan Joshi',
    bio: 'Startup founder marketing consultant Mumbai',
    city: 'Mumbai', country: 'India',
    language: ['english', 'hindi'],
    followers: 41000, avg_views: 4900,
    avg_likes: 760, avg_comments: 98,
    engagement_rate: 4.1,
    estimated_cost_min: 12000, estimated_cost_max: 18000,
    is_verified: false,
    niche: 'business startup marketing',
    gender: 'male',
    tags: ['business', 'startup', 'marketing',
      'entrepreneur', 'branding', 'b2b', 'consulting']
  },
  {
    id: '11', external_id: 'ig_pooja001',
    platform: 'instagram', handle: '@poojafashion',
    full_name: 'Pooja Mehta',
    bio: 'Fashion blogger OOTD styling Mumbai streetwear',
    city: 'Mumbai', country: 'India',
    language: ['hindi', 'english'],
    followers: 38000, avg_views: 11200,
    avg_likes: 2800, avg_comments: 210,
    engagement_rate: 5.3,
    estimated_cost_min: 9000, estimated_cost_max: 14000,
    is_verified: true,
    niche: 'fashion style clothing',
    gender: 'female',
    tags: ['fashion', 'style', 'ootd', 'clothing',
      'streetwear', 'trendy', 'styling', 'outfits',
      'sustainable', 'eco', 'thrift']
  },
  {
    id: '12', external_id: 'ig_riya001',
    platform: 'instagram', handle: '@riyatravels',
    full_name: 'Riya Patel',
    bio: 'Travel photographer adventure nature Ahmedabad',
    city: 'Ahmedabad', country: 'India',
    language: ['gujarati', 'hindi', 'english'],
    followers: 55000, avg_views: 16000,
    avg_likes: 3200, avg_comments: 245,
    engagement_rate: 4.3,
    estimated_cost_min: 11000, estimated_cost_max: 17000,
    is_verified: false,
    niche: 'travel photography adventure',
    gender: 'female',
    tags: ['travel', 'photography', 'adventure',
      'explore', 'wanderlust', 'india', 'nature']
  }
]

// ─── RELEVANCE SCORER ───
// Scores 0-100 how well influencer matches filters
function getRelevanceScore(
  influencer: any,
  filters: any
): { score: number; breakdown: any } {
  const breakdown = {
    niche: 0, location: 0,
    platform: 0, followers: 0, budget: 0
  }

  // Build searchable text
  const searchableText = [
    influencer.niche || '',
    influencer.bio || '',
    ...(influencer.tags || [])
  ].join(' ').toLowerCase()

  // 1. NICHE MATCH — 40 points
  const searchTerms: string[] = []
  if (filters.niche) {
    filters.niche.toLowerCase()
      .split(' ')
      .filter((w: string) => w.length > 2)
      .forEach((w: string) => searchTerms.push(w))
  }
  if (filters.keywords?.length > 0) {
    filters.keywords
      .map((k: string) => k.toLowerCase())
      .filter((k: string) => k.length > 2)
      .forEach((k: string) => {
        if (!searchTerms.includes(k))
          searchTerms.push(k)
      })
  }
  if (searchTerms.length > 0) {
    const matched = searchTerms.filter(term =>
      searchableText.includes(term)
    )
    breakdown.niche = Math.round(
      (matched.length / searchTerms.length) * 40
    )
  } else {
    breakdown.niche = 40
  }

  // 2. LOCATION MATCH — 25 points
  if (filters.location) {
    const loc = filters.location.toLowerCase().trim()
    const city = influencer.city.toLowerCase().trim()
    breakdown.location = (
      city === loc ||
      city.includes(loc) ||
      loc.includes(city)
    ) ? 25 : 0
  } else {
    breakdown.location = 25
  }

  // 3. PLATFORM MATCH — 20 points
  if (filters.platforms?.length > 0) {
    breakdown.platform = filters.platforms
      .includes(influencer.platform) ? 20 : 0
  } else {
    breakdown.platform = 20
  }

  // 4. FOLLOWER RANGE — 10 points (FIXED)
  const followers = influencer.followers
  const minF = filters.min_followers ?? null
  const maxF = filters.max_followers ?? null
  if (minF !== null && maxF !== null) {
    breakdown.followers =
      (followers >= minF && followers <= maxF) ? 10 : 0
  } else if (minF !== null) {
    breakdown.followers = followers >= minF ? 10 : 0
  } else if (maxF !== null) {
    breakdown.followers = followers <= maxF ? 10 : 0
  } else {
    breakdown.followers = 10
  }

  // 5. BUDGET MATCH — 5 points
  if (filters.max_budget_inr) {
    breakdown.budget = influencer.estimated_cost_min
      <= filters.max_budget_inr ? 5 : 0
  } else {
    breakdown.budget = 5
  }

  const total = Object.values(breakdown)
    .reduce((a, b) => a + (b as number), 0)

  return { score: Math.round(total as number), breakdown }
}

// ─── MAIN POST HANDLER ───
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json(
      { error: 'Unauthorized' }, { status: 401 }
    )

    const { query, filters } = await request.json()

    const { data: brand } = await supabase
      .from('brands')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // STEP 1: Score all by relevance
    const withRelevance = MOCK_INFLUENCERS.map(inf => {
      const { score, breakdown } =
        getRelevanceScore(inf, filters || {})
      return { ...inf, relevance_score: score, breakdown }
    })

    // STEP 2: Hard filters (always applied strictly)
    let candidates = [...withRelevance]

    // Platform: hard cutoff
    if (filters?.platforms?.length > 0) {
      candidates = candidates.filter(inf =>
        filters.platforms.includes(inf.platform)
      )
    }

    // Followers: hard cutoff (FIXED NULL CHECKS)
    if (filters?.min_followers != null) {
      candidates = candidates.filter(inf =>
        inf.followers >= filters.min_followers
      )
    }
    if (filters?.max_followers != null) {
      candidates = candidates.filter(inf =>
        inf.followers <= filters.max_followers
      )
    }

    // Budget: hard cutoff
    if (filters?.max_budget_inr) {
      candidates = candidates.filter(inf =>
        inf.estimated_cost_min <= filters.max_budget_inr
      )
    }

    // Gender: hard cutoff
    if (filters?.gender) {
      candidates = candidates.filter(inf =>
        inf.gender === filters.gender
      )
    }

    // STEP 3: Soft niche filter
    // If niche/keyword filters active, require
    // at least 1 keyword match (score >= 25)
    const hasNicheFilter = filters && (
      filters.keywords?.length > 0 || filters.niche
    )
    if (hasNicheFilter) {
      const nicheFiltered = candidates.filter(inf =>
        inf.relevance_score >= 25
      )
      // Only apply if we still have 2+ results
      // otherwise show all candidates
      if (nicheFiltered.length >= 2) {
        candidates = nicheFiltered
      }
    }

    // STEP 4: Sort by relevance
    candidates.sort((a, b) =>
      b.relevance_score - a.relevance_score
    )

    // STEP 5: AI scoring for top 8 only
    const topCandidates = candidates.slice(0, 8)

    const scoredResults = await Promise.all(
      topCandidates.map(async (influencer) => {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_APP_URL}/api/ai/match-score`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Cookie': request.headers.get('cookie') || ''
              },
              body: JSON.stringify({
                influencer,
                search_context: {
                  query,
                  niche: filters?.niche,
                  keywords: filters?.keywords,
                  location: filters?.location
                }
              })
            }
          )
          const data = await res.json()
          // Blend: 60% AI + 40% relevance
          const blended = data.score
            ? Math.round(
              (data.score * 0.6) +
              (influencer.relevance_score * 0.4)
            )
            : influencer.relevance_score

          return {
            ...influencer,
            match_score: Math.min(99, blended),
            ai_insight: data.insight ||
              'Good potential match for your campaign.'
          }
        } catch {
          return {
            ...influencer,
            match_score: influencer.relevance_score,
            ai_insight: 'Potential match for your campaign.'
          }
        }
      })
    )

    // STEP 6: Final sort
    scoredResults.sort((a, b) =>
      b.match_score - a.match_score
    )

    // STEP 7: Debug log (remove before production)
    console.log('\n🔍 SEARCH DEBUG')
    console.log('Query:', query)
    console.log('Filters received:', filters)
    console.log('After hard filters:', candidates.length)
    scoredResults.forEach(r => {
      console.log(
        `${r.handle} | ${r.city} | ${r.niche}`,
        `| relevance: ${r.relevance_score}%`,
        `| final: ${r.match_score}%`
      )
    })

    // STEP 8: Save to search history
    if (brand) {
      await supabase.from('search_history').insert({
        brand_id: brand.id,
        query: query || '',
        filters: filters || {},
        results_count: scoredResults.length,
        status: 'completed'
      })
    }

    return NextResponse.json({
      success: true,
      results: scoredResults,
      total: scoredResults.length
    })

  } catch (error: any) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: error.message }, { status: 500 }
    )
  }
}
