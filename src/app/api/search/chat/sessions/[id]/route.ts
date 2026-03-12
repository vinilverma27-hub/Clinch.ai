import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET — Retrieve a specific session
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { id } = await params
        const { data: session, error } = await supabase
            .from('chat_sessions')
            .select('*')
            .eq('id', id)
            .single()

        if (error) throw error
        return NextResponse.json({ session })
    } catch (error: any) {
        console.error('Chat session individual GET error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// PUT — Update messages or title
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { id } = await params
        const { messages, title } = await request.json()

        const updates: any = { updated_at: new Date().toISOString() }
        if (messages) updates.messages = messages
        if (title) updates.title = title

        const { data: session, error } = await supabase
            .from('chat_sessions')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return NextResponse.json({ session })
    } catch (error: any) {
        console.error('Chat session individual PUT error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
