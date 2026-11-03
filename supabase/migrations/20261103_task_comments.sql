-- Migration: Task Comments & Attachments for Task Collaboration
-- Date: 2026-11-03

CREATE TABLE IF NOT EXISTS public.task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_nickname TEXT NOT NULL,
  author_avatar TEXT,
  content TEXT NOT NULL,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER PUBLICATION supabase_realtime ADD TABLE public.task_comments;
