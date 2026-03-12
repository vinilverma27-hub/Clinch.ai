import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Ideally this would be fetched from database, but reusing mock for now
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
    tags: ['fitness', 'health', 'gym', 'workout',
      'transformation', 'nutrition', 'bodybuilding']
  },
  {
    id: '7', external_id: 'ig_divya001',
    platform: 'instagram', handle: '@divyabeauty',
    full_name: 'Divya Menon',
    bio: 'Makeup tutorials beauty reviews looks Kochi',
    city: 'Kochi', country: 'India',
    language: ['malayalam', 'english'],
    followers: 22000, avg_views: 6500,
    avg_likes: 1400, avg_comments: 112,
    engagement_rate: 6.8,
    estimated_cost_min: 5000, estimated_cost_max: 8000,
    is_verified: false,
    niche: 'beauty makeup tutorials',
    tags: ['beauty', 'makeup', 'tutorials', 'cosmetics',
      'looks', 'skincare', 'mua', 'reviews']
  },
  {
    id: '8', external_id: 'li_rohan001',
    platform: 'linkedin', handle: '@rohanbiz',
    full_name: 'Rohan Joshi',
    bio: 'Startup founder entrepreneurship B2B growth Bangalore',
    city: 'Bangalore', country: 'India',
    language: ['english', 'hindi', 'kannada'],
    followers: 41000, avg_views: 4500,
    avg_likes: 670, avg_comments: 89,
    engagement_rate: 1.8,
    estimated_cost_min: 12000, estimated_cost_max: 18000,
    is_verified: true,
    niche: 'startups entrepreneurship B2B',
    tags: ['startup', 'founder', 'business', 'growth',
      'entrepreneur', 'b2b', 'saas', 'funding']
  },
  {
    id: '9', external_id: 'yt_kabir001',
    platform: 'youtube', handle: '@kabirtech',
    full_name: 'Kabir Singh',
    bio: 'PC builds software engineering coding tutorials Delhi',
    city: 'Delhi', country: 'India',
    language: ['hindi', 'english'],
    followers: 92000, avg_views: 28000,
    avg_likes: 3100, avg_comments: 420,
    engagement_rate: 3.8,
    estimated_cost_min: 20000, estimated_cost_max: 30000,
    is_verified: true,
    niche: 'technology coding tutorials',
    tags: ['tech', 'coding', 'programming', 'software',
      'tutorials', 'pcbuild', 'hardware', 'developer']
  },
  {
    id: '10', external_id: 'ig_vinil001',
    platform: 'instagram', handle: '@vinil_verma',
    full_name: 'Vinil Verma',
    bio: 'Lifestyle fashion travel food Pune',
    city: 'Pune', country: 'India',
    language: ['hindi', 'english', 'marathi'],
    followers: 0, avg_views: 0,
    avg_likes: 0, avg_comments: 0,
    engagement_rate: 0,
    estimated_cost_min: 0, estimated_cost_max: 0,
    is_verified: false,
    niche: 'lifestyle fashion food',
    tags: ['lifestyle', 'fashion', 'travel', 'food',
      'pune', 'india', 'explore', 'daily']
  },
  {
    id: '11', external_id: 'ig_karan001',
    platform: 'instagram', handle: '@karan.styles',
    full_name: 'Karan Malhotra',
    bio: 'Men’s fashion streetwear styling tips Delhi',
    city: 'Delhi', country: 'India',
    language: ['hindi', 'english', 'punjabi'],
    followers: 34000, avg_views: 9800,
    avg_likes: 1800, avg_comments: 156,
    engagement_rate: 5.7,
    estimated_cost_min: 7000, estimated_cost_max: 11000,
    is_verified: false,
    niche: 'fashion style clothing',
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
    tags: ['travel', 'photography', 'adventure',
      'explore', 'wanderlust', 'india', 'nature']
  }
]

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // 1. Try fetching from the actual influencers table first
        const { data: infData, error: infError } = await supabase
            .from('influencers')
            .select('*')
            .eq('id', id)
            .single()

        if (!infError && infData) {
            return NextResponse.json({ influencer: infData })
        }

        // 2. Fallback to mock data (for AI search mock influencers that aren't in the DB yet)
        const mockInfluencer = MOCK_INFLUENCERS.find(inf => inf.id === id || inf.external_id === id)
        
        if (mockInfluencer) {
            return NextResponse.json({ influencer: mockInfluencer })
        }

        return NextResponse.json({ error: 'Influencer not found' }, { status: 404 })

    } catch (error: any) {
        console.error('Error fetching influencer:', error)
        return NextResponse.json(
            { error: error.message || 'Unexpected server error' },
            { status: 500 }
        )
    }
}
