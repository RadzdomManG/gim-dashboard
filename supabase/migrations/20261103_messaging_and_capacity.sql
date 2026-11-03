-- Grace in Motion (GIM) — Messaging, Channels, Approvals & Capacity Schema
-- Migration: 20261103_messaging_and_capacity.sql

-- 1. CHANNELS TABLE
CREATE TABLE IF NOT EXISTS public.channels (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'channel', -- 'channel' or 'dm'
    description TEXT,
    is_private BOOLEAN NOT NULL DEFAULT false,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.messages (
    id TEXT PRIMARY KEY,
    channel_id TEXT NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
    sender_id TEXT NOT NULL,
    sender_name TEXT NOT NULL,
    sender_nickname TEXT NOT NULL,
    sender_avatar TEXT,
    sender_role TEXT NOT NULL,
    is_core_admin BOOLEAN NOT NULL DEFAULT false,
    content TEXT NOT NULL,
    attachments JSONB DEFAULT '[]'::jsonb,
    reactions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. APPROVALS TABLE
CREATE TABLE IF NOT EXISTS public.deliverable_approvals (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL,
    title TEXT NOT NULL,
    client TEXT NOT NULL,
    submitted_by TEXT NOT NULL,
    assigned_reviewer TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending Review', -- 'Pending Review', 'Approved', 'Changes Requested'
    priority TEXT NOT NULL DEFAULT 'Normal',
    summary TEXT NOT NULL,
    deliverable_url TEXT,
    target_milestone TEXT NOT NULL,
    review_notes TEXT,
    reviewed_at TIMESTAMPTZ,
    reviewed_by TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. TEAM CAPACITY LEDGER
CREATE TABLE IF NOT EXISTS public.team_capacity (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    nickname TEXT NOT NULL,
    role TEXT NOT NULL,
    is_core_admin BOOLEAN NOT NULL DEFAULT false,
    capacity_hours INTEGER NOT NULL DEFAULT 40,
    allocated_hours INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'Optimal',
    assigned_clients TEXT[] DEFAULT '{}',
    primary_focus TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliverable_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_capacity ENABLE ROW LEVEL SECURITY;

-- Read policies for authenticated users
CREATE POLICY "Allow authenticated read channels"
ON public.channels FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated read messages"
ON public.messages FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated insert messages"
ON public.messages FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated read approvals"
ON public.deliverable_approvals FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated read capacity"
ON public.team_capacity FOR SELECT
TO authenticated
USING (true);
