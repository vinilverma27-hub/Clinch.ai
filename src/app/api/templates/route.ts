import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data: brand, error: brandError } = await supabase
            .from('brands')
            .select('*')
            .eq('user_id', user.id)
            .single()

        if (brandError) throw brandError

        let { data: templates, error: templatesError } = await supabase
            .from('templates')
            .select('*')
            .eq('brand_id', brand.id)
            .order('created_at', { ascending: false })

        if (templatesError) throw templatesError

        // Seed default templates if count is 0
        if (!templates || templates.length === 0) {
            const now = new Date()
            const createDate = (daysAgo: number) => {
                const d = new Date(now)
                d.setDate(d.getDate() - daysAgo)
                return d.toISOString()
            }

            const defaultTemplates = [
                {
                    brand_id: brand.id,
                    name: "Summer Campaign — Initial Outreach",
                    channel: "email",
                    subject: "Collaboration opportunity with {brand_name}",
                    body: "Hi {first_name}! 👋\n\nI came across your {platform} content and loved your recent posts. We're running a Summer campaign that would be a perfect fit for your audience.\n\nWould you be open to a collaboration?\n\nBest,\n{brand_name}",
                    sent_count: 48,
                    opened_count: 34,
                    replied_count: 13,
                    open_rate: 70.8,
                    reply_rate: 27.1,
                    created_at: createDate(21),
                    status: 'active'
                },
                {
                    brand_id: brand.id,
                    name: "Instagram DM — Brand Introduction",
                    channel: "instagram_dm",
                    subject: "",
                    body: "Hey {first_name}! 👋 Love your content. We'd love to collaborate with you on our upcoming campaign. Interested? 🙌",
                    sent_count: 0,
                    opened_count: 0,
                    replied_count: 0,
                    open_rate: 0,
                    reply_rate: 0,
                    created_at: createDate(18),
                    status: 'active'
                },
                {
                    brand_id: brand.id,
                    name: "LinkedIn B2B Outreach — Tech Brands",
                    channel: "linkedin",
                    subject: "Partnership opportunity",
                    body: "Hi {first_name},\n\nI came across your LinkedIn profile and was impressed by your work in the tech space. We're looking for authentic voices for our B2B campaign.\n\nWould you be open to a quick call?\n\nBest regards,\n{brand_name}",
                    sent_count: 0,
                    opened_count: 0,
                    replied_count: 0,
                    open_rate: 0,
                    reply_rate: 0,
                    created_at: createDate(16),
                    status: 'active'
                },
                {
                    brand_id: brand.id,
                    name: "Follow-up — No Reply Sequence",
                    channel: "email",
                    subject: "Re: Collaboration with {brand_name}",
                    body: "Hi {first_name},\n\nJust following up on my previous message! We think your audience would genuinely love our product.\n\nWe'd love to make this work — happy to adjust the brief to fit your style.\n\nBest,\n{brand_name}",
                    sent_count: 36,
                    opened_count: 22,
                    replied_count: 7,
                    open_rate: 61.1,
                    reply_rate: 19.4,
                    created_at: createDate(14),
                    status: 'active'
                }
            ]

            const { data: insertedTemplates, error: insertError } = await supabase
                .from('templates')
                .insert(defaultTemplates)
                .select('*')
                .order('created_at', { ascending: false })

            if (insertError) throw insertError
            templates = insertedTemplates
        }

        // Compute aggregate stats
        const count = templates?.length || 0;
        const totalSent = templates?.reduce((sum, t) => sum + (t.sent_count || 0), 0) || 0;
        
        let avgOpenRate = 0;
        let avgReplyRate = 0;
        
        const templatesWithSends = templates?.filter(t => (t.sent_count || 0) > 0) || [];
        if (templatesWithSends.length > 0) {
            const sumOpen = templatesWithSends.reduce((sum, t) => sum + parseFloat(t.open_rate || 0), 0);
            const sumReply = templatesWithSends.reduce((sum, t) => sum + parseFloat(t.reply_rate || 0), 0);
            avgOpenRate = Math.round((sumOpen / templatesWithSends.length) * 10) / 10;
            avgReplyRate = Math.round((sumReply / templatesWithSends.length) * 10) / 10;
        }

        const stats = {
            total_templates: count,
            total_sent: totalSent,
            avg_open_rate: avgOpenRate,
            avg_reply_rate: avgReplyRate
        }

        return NextResponse.json({ templates, stats })

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data: brand } = await supabase
            .from('brands')
            .select('id')
            .eq('user_id', user.id)
            .single()
            
        if (!brand) throw new Error('Brand not found')

        const payload = await request.json()
        
        const newTemplate = {
            brand_id: brand.id,
            name: payload.name,
            subject: payload.subject || '',
            body: payload.body || '',
            channel: payload.channel || 'email',
            sent_count: 0,
            opened_count: 0,
            replied_count: 0,
            open_rate: 0,
            reply_rate: 0,
            status: 'active'
        }

        const { data: insertedTemplate, error } = await supabase
            .from('templates')
            .insert(newTemplate)
            .select('*')
            .single()

        if (error) throw error
        
        return NextResponse.json({ template: insertedTemplate })

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
