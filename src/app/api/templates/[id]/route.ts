import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params
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
            
        if (!brand) throw new Error("Brand not found")

        const { data: template, error } = await supabase
            .from('templates')
            .select('*')
            .eq('id', id)
            .eq('brand_id', brand.id)
            .single()

        if (error) throw error

        return NextResponse.json({ template })

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params
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
            
        if (!brand) throw new Error("Brand not found")

        const payload = await request.json()
        
        let updates: any = {
            updated_at: new Date().toISOString()
        }
        
        // Update direct fields
        if (payload.name !== undefined) updates.name = payload.name
        if (payload.subject !== undefined) updates.subject = payload.subject
        if (payload.body !== undefined) updates.body = payload.body
        if (payload.channel !== undefined) updates.channel = payload.channel
        if (payload.status !== undefined) updates.status = payload.status
        
        // Update counts and recalculate rates if counts changed
        let countsChanged = false
        if (payload.sent_count !== undefined) {
            updates.sent_count = payload.sent_count
            countsChanged = true
        }
        if (payload.opened_count !== undefined) {
            updates.opened_count = payload.opened_count
            countsChanged = true
        }
        if (payload.replied_count !== undefined) {
            updates.replied_count = payload.replied_count
            countsChanged = true
        }
        
        if (countsChanged) {
            // First fetch the current values if some aren't in payload
            const { data: current } = await supabase
                .from('templates')
                .select('sent_count, opened_count, replied_count')
                .eq('id', id)
                .single()
                
            if (current) {
                const s = updates.sent_count !== undefined ? updates.sent_count : current.sent_count
                const o = updates.opened_count !== undefined ? updates.opened_count : current.opened_count
                const r = updates.replied_count !== undefined ? updates.replied_count : current.replied_count
                
                if (s > 0) {
                    updates.open_rate = Math.round((o / s * 100) * 10) / 10
                    updates.reply_rate = Math.round((r / s * 100) * 10) / 10
                } else {
                    updates.open_rate = 0
                    updates.reply_rate = 0
                }
            }
        }

        const { data: updatedTemplate, error } = await supabase
            .from('templates')
            .update(updates)
            .eq('id', id)
            .eq('brand_id', brand.id)
            .select('*')
            .single()

        if (error) throw error
        
        return NextResponse.json({ template: updatedTemplate })

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params
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
            
        if (!brand) throw new Error("Brand not found")

        const { error } = await supabase
            .from('templates')
            .delete()
            .eq('id', id)
            .eq('brand_id', brand.id)

        if (error) throw error
        
        return NextResponse.json({ success: true })

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
