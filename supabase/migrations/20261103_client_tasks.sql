-- Migration: Client Tasks for Calendar, Deadlines, & Status Workflows
-- Date: 2026-11-03

CREATE TABLE IF NOT EXISTS public.client_tasks (
  id TEXT PRIMARY KEY DEFAULT ('tsk-' || substr(md5(random()::text), 1, 10)),
  title TEXT NOT NULL,
  client TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'To Do',
  priority TEXT NOT NULL DEFAULT 'Normal',
  due_date TIMESTAMPTZ,
  assignee_name TEXT,
  assignee_id TEXT,
  created_by TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER PUBLICATION supabase_realtime ADD TABLE public.client_tasks;
