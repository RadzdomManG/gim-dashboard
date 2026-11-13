import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { fetchClickUpTasks } from '@/lib/clickup/client';

export const dynamic = 'force-dynamic';

export interface SearchResultItem {
  id: string;
  type: 'task' | 'message' | 'comment' | 'client' | 'sop' | 'team' | 'deliverable';
  title: string;
  subtitle?: string;
  snippet?: string;
  metadata?: Record<string, any>;
  url?: string;
  date?: string;
  status?: string;
  badge?: string;
}

const STATIC_CLIENTS = [
  {
    id: 'we-rock-the-spectrum',
    name: 'We Rock the Spectrum (WRTS)',
    code: 'WRTS-US',
    industry: 'Sensory Gym Franchise Operations',
    contact: 'Chris & Niko',
    lead: 'Erwin Manaog',
    specialist: 'BJ Ricafrente & Aldwin',
    retainer: 'USD $4,000 / mo',
    status: 'Active Sprint',
    description: 'Sensory gym franchise operations, 21 n8n workflows, POS and lead generation sync.',
  },
  {
    id: 'studio-nets',
    name: 'Studio Nets',
    code: 'SN-AU',
    industry: 'Design & Creative Systems',
    contact: 'Netanya Cruz (Creative Director)',
    lead: 'Divine Origines',
    specialist: 'Radzdom Gallego',
    retainer: 'AUD $3,800 / mo',
    status: 'Active Sprint',
    description: 'Design and brand system, Figma asset ingestion, client portal delivery.',
  },
  {
    id: 'invogue-cleans',
    name: 'InVogue Cleans',
    code: 'IVC-US',
    industry: 'Premium Cleaning Services',
    contact: 'Siddharth Nair (Managing Partner)',
    lead: 'Ma. Rose Anne Malinao',
    specialist: 'Erwin Manaog',
    retainer: 'USD $3,200 / mo',
    status: 'Active Sprint',
    description: 'Lead conversion and customer retention system for premium cleaning services.',
  },
  {
    id: 'aaron-ofosu',
    name: 'Aaron Ofosu Bootcamp',
    code: 'AO-UK',
    industry: 'Fitness & Athlete Coaching',
    contact: 'Aaron Ofosu (Head Coach)',
    lead: 'Divine Origines',
    specialist: 'Erwin Manaog',
    retainer: 'GBP £2,900 / mo',
    status: 'Active Sprint',
    description: 'Bootcamp cohort management, athlete onboarding, Stripe subscription checkout.',
  },
  {
    id: 'tch2thrive',
    name: 'Tch2Thrive',
    code: 'T2T-US',
    industry: 'Early Childhood Education',
    contact: 'Dr. Evelyn Reed (Director)',
    lead: 'Divine Origines',
    specialist: 'Radzdom Gallego',
    retainer: 'USD $4,000 / mo',
    status: 'Discovery Intake',
    description: 'Early childhood educator micro-credential courses, intake funnels.',
  },
];

const STATIC_SOPS = [
  {
    id: 'sop-studio-nets-ops',
    title: 'Studio Nets: Design Ingestion Systems & Creative Ops Runbook',
    category: 'Creative Operations',
    clientScope: 'Studio Nets',
    author: 'Erwin Manaog',
    summary: 'Standard operating procedure for intake questionnaires, Figma design handoff pipelines, and asset revision tracking.',
  },
  {
    id: 'sop-cc-spec',
    title: 'GIM Command Center & Operations Specification',
    category: 'Strategy',
    clientScope: 'all',
    author: 'Divine Origines',
    summary: 'Core operating architecture for GIM: client delivery pipelines, gate sign-off protocols, and team workload matrices.',
  },
  {
    id: 'sop-ghl-ops',
    title: 'GoHighLevel Multi-Location Automation & Sub-Account Provisioning',
    category: 'Automation & Tech',
    clientScope: 'all',
    author: 'Radzdom Gallego (Radz)',
    summary: 'Standard operating procedure for provisioning client sub-accounts, HIPAA/privacy audit checks, and Twilio phone setup.',
  },
  {
    id: 'sop-cu-mirror',
    title: 'ClickUp Read-Only Operational Mirror & Supabase Bridge',
    category: 'Internal Operations',
    clientScope: 'all',
    author: 'Radzdom Gallego (Radz)',
    summary: 'Security guidelines for bidirectional task visibility without write mutation to client project workspaces.',
  },
];

const TEAM_MEMBERS = [
  {
    id: 'divine',
    name: 'Divine Origines',
    nickname: 'Divine',
    email: 'divine@graceinmotion.agency',
    role: 'Owner',
    title: 'Founder & Strategy Lead',
    clientScope: 'all',
  },
  {
    id: 'radz',
    name: 'Radzdom Gallego',
    nickname: 'Radz',
    email: 'radz@graceinmotion.agency',
    role: 'Admin',
    title: 'Admin / AI & Automations Specialist',
    clientScope: 'all',
  },
  {
    id: 'ra',
    name: 'Ma. Rose Anne Malinao',
    nickname: 'RA',
    email: 'ra@graceinmotion.agency',
    role: 'Admin',
    title: 'Admin / Operations Manager',
    clientScope: 'all',
  },
  {
    id: 'erwin',
    name: 'Erwin Manaog',
    nickname: 'Erwin',
    email: 'erwin@graceinmotion.agency',
    role: 'Team Specialist',
    title: 'Senior Technical Lead & Integrations Specialist',
    clientScope: 'We Rock the Spectrum (WRTS), InVogue Cleans, Studio Nets',
  },
  {
    id: 'aaron',
    name: 'Aaron Ofosu',
    nickname: 'Aaron',
    email: 'aaron@juviboltcybertech.com',
    role: 'Client Stakeholder',
    title: 'Founder, Juvibolt Cybertech',
    clientScope: 'Juvibolt Cybertech',
  },
  {
    id: 'bj',
    name: 'BJ',
    nickname: 'BJ',
    email: 'bj@graceinmotion.agency',
    role: 'Team Specialist',
    title: 'Frontend & Funnel Specialist',
    clientScope: 'We Rock the Spectrum (WRTS), Grace In Motion (Internal)',
  },
];

export async function GET(req: NextRequest) {
  try {
    const q = (req.nextUrl.searchParams.get('q') || '').trim().toLowerCase();
    const words = q.split(/\s+/).filter(Boolean);

    if (!q || words.length === 0) {
      return NextResponse.json({
        totalCount: 0,
        results: {
          tasks: [],
          messages: [],
          comments: [],
          clients: [],
          sops: [],
          team: [],
        },
      });
    }

    const supabase = createAdminClient();

    // 1. Search Tasks (ClickUp + Supabase)
    let matchedTasks: SearchResultItem[] = [];
    try {
      const clickupData = await fetchClickUpTasks();
      const cuTasks = (clickupData?.tasks || []).map((t) => ({
        id: t.id,
        title: t.name,
        client: t.client,
        description: t.description || '',
        status: t.status || 'To Do',
        priority: t.priority || 'Normal',
        dueDate: t.dueDate ? new Date(t.dueDate).toISOString() : null,
        gateCode: t.gateCode,
      }));

      // Supabase tasks
      const { data: supaTasks } = await supabase.from('client_tasks').select('*');
      const allTasks = [...(supaTasks || []), ...cuTasks];

      matchedTasks = allTasks
        .filter((t) => {
          const haystack = `${t.title || ''} ${t.description || ''} ${t.client || ''} ${t.status || ''} ${t.gateCode || ''} ${(t.tags || []).join(' ')}`.toLowerCase();
          return words.every((word) => haystack.includes(word));
        })
        .slice(0, 15)
        .map((t) => ({
          id: t.id,
          type: 'task',
          title: t.title,
          subtitle: `${t.client} • ${t.status}`,
          snippet: t.description ? t.description.slice(0, 120) + '...' : undefined,
          status: t.status,
          badge: t.client,
          date: t.due_date || t.dueDate || undefined,
          metadata: {
            client: t.client,
            status: t.status,
            priority: t.priority,
            taskId: t.id,
          },
        }));
    } catch (taskErr) {
      console.error('Search tasks error:', taskErr);
    }

    // 2. Search Messages (Supabase)
    let matchedMessages: SearchResultItem[] = [];
    try {
      const { data: msgs } = await supabase
        .from('messages')
        .select('*')
        .or(`content.ilike.%${q}%,sender_name.ilike.%${q}%,sender_nickname.ilike.%${q}%`)
        .order('created_at', { ascending: false })
        .limit(10);

      matchedMessages = (msgs || []).map((m) => ({
        id: m.id,
        type: 'message',
        title: `${m.sender_nickname || m.sender_name} in #${m.channel_id}`,
        subtitle: new Date(m.created_at).toLocaleDateString('en-AU', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        snippet: m.content,
        badge: `#${m.channel_id}`,
        date: m.created_at,
        metadata: {
          channelId: m.channel_id,
          messageId: m.id,
          senderName: m.sender_name,
        },
      }));
    } catch (msgErr) {
      console.error('Search messages error:', msgErr);
    }

    // 3. Search Task Comments (Supabase)
    let matchedComments: SearchResultItem[] = [];
    try {
      const { data: comments } = await supabase
        .from('task_comments')
        .select('*')
        .or(`content.ilike.%${q}%,author_name.ilike.%${q}%,author_nickname.ilike.%${q}%`)
        .order('created_at', { ascending: false })
        .limit(10);

      matchedComments = (comments || []).map((c) => ({
        id: c.id,
        type: 'comment',
        title: `Comment by ${c.author_nickname || c.author_name}`,
        subtitle: `Task #${c.task_id}`,
        snippet: c.content,
        badge: 'Comment',
        date: c.created_at,
        metadata: {
          taskId: c.task_id,
          commentId: c.id,
        },
      }));
    } catch (commErr) {
      console.error('Search comments error:', commErr);
    }

    // 4. Search Clients
    const matchedClients: SearchResultItem[] = STATIC_CLIENTS.filter((c) => {
      const haystack = `${c.name} ${c.code} ${c.industry} ${c.description} ${c.contact} ${c.lead} ${c.specialist}`.toLowerCase();
      return words.every((word) => haystack.includes(word));
    }).map((c) => ({
      id: c.id,
      type: 'client',
      title: c.name,
      subtitle: `${c.industry} • Lead: ${c.lead}`,
      snippet: c.description,
      status: c.status,
      badge: c.code,
      metadata: {
        clientName: c.name,
        retainer: c.retainer,
        contact: c.contact,
      },
    }));

    // 5. Search SOPs & Playbooks
    const matchedSops: SearchResultItem[] = STATIC_SOPS.filter((s) => {
      const haystack = `${s.title} ${s.category} ${s.summary} ${s.clientScope || ''} ${s.author}`.toLowerCase();
      return words.every((word) => haystack.includes(word));
    }).map((s) => ({
      id: s.id,
      type: 'sop',
      title: s.title,
      subtitle: `${s.category} • Author: ${s.author}`,
      snippet: s.summary,
      badge: s.category,
      metadata: {
        sopId: s.id,
        clientScope: s.clientScope,
      },
    }));

    // 6. Search Team Members
    const matchedTeam: SearchResultItem[] = TEAM_MEMBERS.filter((tm) => {
      const haystack = `${tm.name} ${tm.nickname} ${tm.email} ${tm.role} ${tm.title} ${tm.clientScope}`.toLowerCase();
      return words.every((word) => haystack.includes(word));
    }).map((tm) => ({
      id: tm.id,
      type: 'team',
      title: `${tm.name} (${tm.nickname})`,
      subtitle: `${tm.title} • ${tm.role}`,
      snippet: `Assigned Clients: ${tm.clientScope}`,
      badge: tm.role,
      metadata: {
        email: tm.email,
        memberId: tm.id,
      },
    }));

    const totalCount =
      matchedTasks.length +
      matchedMessages.length +
      matchedComments.length +
      matchedClients.length +
      matchedSops.length +
      matchedTeam.length;

    return NextResponse.json({
      query: q,
      totalCount,
      results: {
        tasks: matchedTasks,
        messages: matchedMessages,
        comments: matchedComments,
        clients: matchedClients,
        sops: matchedSops,
        team: matchedTeam,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown search error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
