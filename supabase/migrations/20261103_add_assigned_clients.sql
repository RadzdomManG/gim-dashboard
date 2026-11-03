-- Migration: Add multi-client assignments to profiles and invitations
-- Date: 2026-11-03

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS assigned_clients text[] DEFAULT '{}';

ALTER TABLE public.invitations 
ADD COLUMN IF NOT EXISTS assigned_clients text[] DEFAULT '{}';
