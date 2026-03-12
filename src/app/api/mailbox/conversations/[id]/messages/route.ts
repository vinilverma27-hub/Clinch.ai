import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const id = (await params).id;
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data: messages, error: msgError } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', id)
            .order('sent_at', { ascending: true })

        if (msgError) {
            throw msgError
        }

        return NextResponse.json({ messages })

    } catch (error: any) {
        console.error('GET /api/mailbox/conversations/[id]/messages error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const id = (await params).id;
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { channel, direction, subject, text, is_ai_draft } = body

        if (!channel || !direction || !text) {
             return NextResponse.json({ error: 'channel, direction, text required' }, { status: 400 })
        }

        const { data: newMessage, error: createError } = await supabase
            .from('messages')
            .insert({
                conversation_id: id,
                channel,
                direction,
                subject: subject || null,
                body: text,
                is_ai_draft: is_ai_draft || false
            })
            .select()
            .single()

        if (createError) {
             throw createError
        }

        return NextResponse.json({ message: newMessage })

    } catch (error: any) {
        console.error('POST /api/mailbox/conversations/[id]/messages error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
