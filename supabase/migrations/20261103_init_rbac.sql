-- =========================================================================
-- GIM Agency OS — Version-Controlled RBAC Migration
-- Migration File: supabase/migrations/20261103_init_rbac.sql
-- Description: Core Admin Team, Role-Based Access Control, Invitations, & RLS
-- =========================================================================

-- 1. Custom Role Enum
DO $$ BEGIN
  CREATE TYPE public.user_role AS ENUM (
    'owner',
    'admin',
    'operations_manager',
    'project_owner',
    'team_member',
    'client_user'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Clients Table (Tenant Boundary)
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  lead_name TEXT,
  contact_name TEXT,
  contact_email TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. User Profiles Table (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role public.user_role NOT NULL DEFAULT 'team_member',
  is_core_admin BOOLEAN NOT NULL DEFAULT false,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. User Module Granular Permissions Table
CREATE TABLE IF NOT EXISTS public.user_module_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  module TEXT NOT NULL,
  can_view BOOLEAN NOT NULL DEFAULT true,
  can_create BOOLEAN NOT NULL DEFAULT false,
  can_edit BOOLEAN NOT NULL DEFAULT false,
  can_assign BOOLEAN NOT NULL DEFAULT false,
  can_delete BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_module UNIQUE (user_id, module)
);

-- 5. User Invitations Table
CREATE TABLE IF NOT EXISTS public.invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role public.user_role NOT NULL DEFAULT 'team_member',
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  token TEXT NOT NULL UNIQUE,
  invited_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at TIMESTAMPTZ,
  is_revoked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================================================================
-- SECURITY DEFINER FUNCTIONS (Prevents Frontend Metadata Tampering)
-- =========================================================================

-- Check if current authenticated session belongs to a Core Admin (Divine, Radz, RA)
CREATE OR REPLACE FUNCTION public.is_core_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND is_active = true
      AND (
        is_core_admin = true 
        OR role IN ('owner', 'admin')
        OR email IN (
          'divine@graceinmotion.agency',
          'radz@graceinmotion.agency',
          'ra@graceinmotion.agency'
        )
      )
  );
$$;

-- Get the client tenant ID for the current authenticated user
CREATE OR REPLACE FUNCTION public.get_auth_client_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT client_id FROM public.profiles
  WHERE id = auth.uid()
  LIMIT 1;
$$;

-- Trigger: Automatically elevate Divine, Radz, and RA upon profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Divine (Owner)
  IF LOWER(NEW.email) = 'divine@graceinmotion.agency' THEN
    NEW.role := 'owner';
    NEW.is_core_admin := true;
  -- Radz (Admin / Specialist)
  ELSIF LOWER(NEW.email) = 'radz@graceinmotion.agency' THEN
    NEW.role := 'admin';
    NEW.is_core_admin := true;
  -- RA (Admin / Core Team)
  ELSIF LOWER(NEW.email) = 'ra@graceinmotion.agency' THEN
    NEW.role := 'admin';
    NEW.is_core_admin := true;
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_bootstrap_core_admins ON public.profiles;
CREATE TRIGGER trg_bootstrap_core_admins
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_profile();

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_module_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- 1. Clients Table Policies
-- Core Admins can do everything
CREATE POLICY "Core Admins full access to clients"
  ON public.clients FOR ALL
  TO authenticated
  USING (public.is_core_admin());

-- Client users and scoped project owners can only view their own assigned client
CREATE POLICY "Scoped users view assigned client only"
  ON public.clients FOR SELECT
  TO authenticated
  USING (id = public.get_auth_client_id());

-- 2. Profiles Table Policies
-- Core Admins can view and manage all profiles
CREATE POLICY "Core Admins full access to profiles"
  ON public.profiles FOR ALL
  TO authenticated
  USING (public.is_core_admin());

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- 3. Invitations Table Policies
-- Only Core Admins can view, create, and revoke invitations
CREATE POLICY "Only Core Admins manage invitations"
  ON public.invitations FOR ALL
  TO authenticated
  USING (public.is_core_admin());

-- 4. User Module Permissions Policies
CREATE POLICY "Core Admins manage permissions"
  ON public.user_module_permissions FOR ALL
  TO authenticated
  USING (public.is_core_admin());

CREATE POLICY "Users read own permissions"
  ON public.user_module_permissions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());
