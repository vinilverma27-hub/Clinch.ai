-- Create conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
    influencer_id UUID NOT NULL REFERENCES public.influencers(id) ON DELETE CASCADE,
    crm_entry_id UUID REFERENCES public.crm_entries(id) ON DELETE SET NULL,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for conversations
CREATE INDEX IF NOT EXISTS idx_conversations_brand_id ON public.conversations(brand_id);
CREATE INDEX IF NOT EXISTS idx_conversations_influencer_id ON public.conversations(influencer_id);

-- Enable RLS on conversations
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Conversations RLS Policies
CREATE POLICY "Users can view their own brand's conversations" ON public.conversations
    FOR SELECT USING (
        brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can insert their own brand's conversations" ON public.conversations
    FOR INSERT WITH CHECK (
        brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can update their own brand's conversations" ON public.conversations
    FOR UPDATE USING (
        brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can delete their own brand's conversations" ON public.conversations
    FOR DELETE USING (
        brand_id IN (SELECT id FROM public.brands WHERE user_id = auth.uid())
    );

-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    channel TEXT NOT NULL CHECK (channel IN ('email', 'instagram_dm', 'linkedin')),
    direction TEXT NOT NULL CHECK (direction IN ('outgoing', 'incoming', 'ai_draft')),
    subject TEXT,
    body TEXT NOT NULL,
    external_msg_id TEXT,
    thread_id TEXT,
    is_read BOOLEAN DEFAULT false NOT NULL,
    is_ai_draft BOOLEAN DEFAULT false NOT NULL,
    ai_confidence TEXT,
    ai_rationale TEXT,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for messages
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sent_at ON public.messages(sent_at);

-- Enable RLS on messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Messages RLS Policies
CREATE POLICY "Users can view their own brand's messages" ON public.messages
    FOR SELECT USING (
        conversation_id IN (
            SELECT id FROM public.conversations WHERE brand_id IN (
                SELECT id FROM public.brands WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can insert their own brand's messages" ON public.messages
    FOR INSERT WITH CHECK (
        conversation_id IN (
            SELECT id FROM public.conversations WHERE brand_id IN (
                SELECT id FROM public.brands WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can update their own brand's messages" ON public.messages
    FOR UPDATE USING (
        conversation_id IN (
            SELECT id FROM public.conversations WHERE brand_id IN (
                SELECT id FROM public.brands WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can delete their own brand's messages" ON public.messages
    FOR DELETE USING (
        conversation_id IN (
            SELECT id FROM public.conversations WHERE brand_id IN (
                SELECT id FROM public.brands WHERE user_id = auth.uid()
            )
        )
    );

-- Trigger to update conversation last_message_at
CREATE OR REPLACE FUNCTION public.update_conversation_last_message_at()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.conversations
    SET last_message_at = NEW.sent_at
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_conversation_last_message_at ON public.messages;
CREATE TRIGGER trg_update_conversation_last_message_at
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.update_conversation_last_message_at();
