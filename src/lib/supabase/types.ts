export type Brand = {
    id: string
    user_id: string
    name: string
    description: string | null
    logo_url: string | null
    industry: string | null
    niche: string | null
    target_age: string | null
    target_gender: string | null
    target_location: string | null
    platforms: string[]
    monthly_budget: string | null
    campaign_goals: string[]
    campaign_brief_url: string | null
    onboarding_complete: boolean
    created_at: string
    updated_at: string
}

export type Influencer = {
    id: string
    external_id: string | null
    platform: 'instagram' | 'youtube' | 'linkedin'
    handle: string
    full_name: string | null
    profile_pic_url: string | null
    bio: string | null
    email: string | null
    city: string | null
    country: string
    language: string[]
    followers: number
    avg_views: number
    avg_likes: number
    avg_comments: number
    engagement_rate: number
    estimated_cost_min: number
    estimated_cost_max: number
    is_verified: boolean
    created_at: string
}

export type CRMEntry = {
    id: string
    brand_id: string
    influencer_id: string
    campaign_name: string
    status: 'not_contacted' | 'email_sent' | 'replied' |
    'negotiating' | 'interested' | 'deal_closed' |
    'content_live' | 'rejected' | 'needs_review'
    match_score: number
    ai_insight: string | null
    estimated_cost: string | null
    agreed_cost: number | null
    notes: string | null
    last_contacted_at: string | null
    created_at: string
    updated_at: string
}

export type Message = {
    id: string
    conversation_id: string
    channel: 'email' | 'instagram_dm' | 'linkedin'
    direction: 'outgoing' | 'incoming' | 'ai_draft'
    subject: string | null
    body: string
    external_msg_id: string | null
    thread_id: string | null
    is_read: boolean
    is_ai_draft: boolean
    ai_confidence: string | null
    ai_rationale: string | null
    sent_at: string
    created_at: string
}

export type Conversation = {
    id: string
    brand_id: string
    influencer_id: string
    crm_entry_id: string | null
    last_message_at: string
    created_at: string
}

export type EmailTemplate = {
    id: string
    brand_id: string
    name: string
    channel: 'email' | 'instagram_dm' | 'linkedin'
    subject: string | null
    body: string
    total_sent: number
    total_opened: number
    total_replied: number
    is_default: boolean
    created_at: string
    updated_at: string
}

export type SearchHistory = {
    id: string
    brand_id: string
    query: string
    filters: Record<string, unknown>
    results_count: number
    status: 'running' | 'completed' | 'cancelled' | 'failed'
    created_at: string
}
