-- =========================================================================
-- GIM Agency OS — Version-Controlled PM Hierarchy Migration
-- Migration File: supabase/migrations/20261118_pm_hierarchy.sql
-- Description: Complete ClickUp-inspired PM hierarchy:
--              Workspace -> Spaces -> Folders -> Lists -> Tasks -> Subtasks -> Checklists
-- =========================================================================

-- 1. WORKSPACES
CREATE TABLE IF NOT EXISTS public.workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  settings JSONB DEFAULT '{"theme": "gim-default", "time_tracking": true}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. SPACES (Core Departments / Business Functions)
CREATE TABLE IF NOT EXISTS public.spaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  icon TEXT DEFAULT 'Folder',
  color TEXT DEFAULT '#3D5249',
  is_private BOOLEAN NOT NULL DEFAULT false,
  status_config JSONB DEFAULT '[
    {"name": "Open", "color": "#d3d3d3", "type": "open"},
    {"name": "To Do", "color": "#e0e0e0", "type": "todo"},
    {"name": "In Progress", "color": "#0084ff", "type": "inprogress"},
    {"name": "Pending Review", "color": "#9b51e0", "type": "review"},
    {"name": "Approved", "color": "#219653", "type": "approved"},
    {"name": "Rejected", "color": "#eb5757", "type": "rejected"},
    {"name": "On Hold", "color": "#f2994a", "type": "hold"},
    {"name": "Completed", "color": "#00b884", "type": "closed"},
    {"name": "Cancelled", "color": "#828282", "type": "cancelled"}
  ]'::jsonb,
  position INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_space_slug_per_ws UNIQUE (workspace_id, slug)
);

-- 3. SPACE MEMBERS
CREATE TABLE IF NOT EXISTS public.space_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member', -- 'admin', 'manager', 'member', 'viewer'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_space_member UNIQUE (space_id, user_id)
);

-- 4. FOLDERS
CREATE TABLE IF NOT EXISTS public.folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#466B53',
  position INTEGER NOT NULL DEFAULT 0,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. LISTS
CREATE TABLE IF NOT EXISTS public.lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES public.folders(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#518E6A',
  status_config JSONB,
  position INTEGER NOT NULL DEFAULT 0,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. TASKS & SUBTASKS (Recursive self-referencing hierarchy)
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID NOT NULL REFERENCES public.lists(id) ON DELETE CASCADE,
  parent_task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'To Do',
  priority TEXT NOT NULL DEFAULT 'Normal', -- 'Urgent', 'High', 'Normal', 'Low'
  creator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  start_date TIMESTAMPTZ,
  due_date TIMESTAMPTZ,
  time_estimate_minutes INTEGER DEFAULT 0,
  time_spent_minutes INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  custom_fields JSONB DEFAULT '{}'::jsonb,
  position INTEGER NOT NULL DEFAULT 0,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. TASK ASSIGNEES (Multi-user assignments)
CREATE TABLE IF NOT EXISTS public.task_assignees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_task_assignee UNIQUE (task_id, user_id)
);

-- 8. CHECKLISTS
CREATE TABLE IF NOT EXISTS public.checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Checklist',
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. CHECKLIST ITEMS
CREATE TABLE IF NOT EXISTS public.checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checklist_id UUID NOT NULL REFERENCES public.checklists(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  assignee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  due_date TIMESTAMPTZ,
  position INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. TASK DEPENDENCIES
CREATE TABLE IF NOT EXISTS public.task_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  depends_on_task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  dependency_type TEXT NOT NULL DEFAULT 'waiting_on', -- 'waiting_on', 'blocking'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_task_dependency UNIQUE (task_id, depends_on_task_id)
);

-- 11. TASK ACTIVITY LOGS
CREATE TABLE IF NOT EXISTS public.task_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.space_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_assignees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_activity_logs ENABLE ROW LEVEL SECURITY;

-- Read Policies
CREATE POLICY "Allow authenticated read workspaces" ON public.workspaces FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read spaces" ON public.spaces FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read space_members" ON public.space_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read folders" ON public.folders FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read lists" ON public.lists FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read tasks" ON public.tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read task_assignees" ON public.task_assignees FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read checklists" ON public.checklists FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read checklist_items" ON public.checklist_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read task_dependencies" ON public.task_dependencies FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read task_activity_logs" ON public.task_activity_logs FOR SELECT TO authenticated USING (true);

-- Enable Realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.spaces;
ALTER PUBLICATION supabase_realtime ADD TABLE public.folders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.lists;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
