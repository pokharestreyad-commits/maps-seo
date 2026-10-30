-- Maps SEO Pro - Supabase PostgreSQL Database Schema
-- Run this in your Supabase SQL Editor when you are ready to persist audits and users.

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Audit History Table
CREATE TABLE IF NOT EXISTS public.audits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    place_id TEXT,
    category TEXT,
    address TEXT,
    phone TEXT,
    website TEXT,
    overall_score INTEGER NOT NULL,
    grade_symbol TEXT NOT NULL,
    grade_label TEXT,
    rating NUMERIC(2, 1),
    reviews_count INTEGER,
    breakdown JSONB NOT NULL DEFAULT '[]'::jsonb,
    critical_issues JSONB DEFAULT '[]'::jsonb,
    quick_wins JSONB DEFAULT '[]'::jsonb,
    competitors_analysis JSONB DEFAULT '{}'::jsonb,
    ai_recommendations JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Scheduled Google Posts Table
CREATE TABLE IF NOT EXISTS public.scheduled_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    audit_id UUID REFERENCES public.audits(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    post_type TEXT DEFAULT 'تحديث أسبوعي',
    hook TEXT NOT NULL,
    body TEXT NOT NULL,
    call_to_action TEXT DEFAULT 'اتصل الآن',
    scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PUBLISHED', 'FAILED')),
    published_at TIMESTAMP WITH TIME ZONE,
    screenshot_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_posts ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies: Allow users to view and insert their own data
CREATE POLICY "Users can view their own audits" 
ON public.audits FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create audits" 
ON public.audits FOR INSERT 
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can view their scheduled posts" 
ON public.scheduled_posts FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their scheduled posts" 
ON public.scheduled_posts FOR ALL 
USING (auth.uid() = user_id);
