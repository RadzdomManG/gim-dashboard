import { NextRequest, NextResponse } from 'next/server';
import { fetchClickUpTasks } from '@/lib/clickup/client';
import { createAdminClient } from '@/lib/supabase/admin';
import { ClickUpTask } from '@/lib/clickup/types';

export const dynamic = 'force-dynamic';

/**
 * GET /api/clickup/tasks
 * Read-only mirror for ClickUp tasks merged with internal client tasks.
 * All mutations remain strictly in Supabase (ClickUp 100% READ-ONLY).
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientFilter = searchParams.get('client'); // 'all' | 'wrts' | 'gim-internal'
    const statusFilter = searchParams.get('status');
    const assigneeFilter = searchParams.get('assignee');
    const search = searchParams.get('search')?.toLowerCase();

    // 1. Fetch ClickUp tasks
    const data = await fetchClickUpTasks();
    let tasks: ClickUpTask[] = [...(data.tasks || [])];

    // 2. Fetch Supabase client_tasks and merge
    try {
      const supabase = createAdminClient();
      const { data: supaTasks, error: supaErr } = await supabase
        .from('client_tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (!supaErr && supaTasks && supaTasks.length > 0) {
        const supaMapped: ClickUpTask[] = supaTasks.map((st: any) => {
          const dueTime = st.due_date ? new Date(st.due_date).getTime() : null;
          const statusLower = (st.status || 'open').toLowerCase();
          let statusType: 'open' | 'custom' | 'done' | 'closed' = 'open';
          let statusColor = '#3B82F6';

          if (statusLower === 'closed' || statusLower === 'done' || statusLower === 'approved') {
            statusType = 'closed';
            statusColor = '#10B981';
          } else if (statusLower.includes('review')) {
            statusType = 'custom';
            statusColor = '#F59E0B';
          } else if (statusLower.includes('progress')) {
            statusType = 'custom';
            statusColor = '#6366F1';
          }

          const assigneeName = st.assignee_name || 'Unassigned';
          const initials = assigneeName
            .split(' ')
            .map((n: string) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2) || 'UA';

          return {
            id: String(st.id),
            name: st.title || 'Untitled Task',
            status: st.status || 'To Do',
            statusColor,
            statusType,
            priority: st.priority || 'Normal',
            priorityColor: st.priority === 'Urgent' ? '#EF4444' : st.priority === 'High' ? '#F97316' : '#64748B',
            listId: 'supabase-local',
            listName: st.client || 'GIM Core',
            client: st.client || 'Grace in Motion',
            assignees: [
              {
                id: st.assignee_id ? Number(st.assignee_id) || 999 : 999,
                username: assigneeName,
                email: '',
                color: '#466B53',
                initials,
              },
            ],
            dueDate: dueTime,
            dueDateFormatted: st.due_date ? new Date(st.due_date).toLocaleDateString() : null,
            startDate: null,
            dateCreated: st.created_at ? new Date(st.created_at).getTime() : Date.now(),
            dateUpdated: st.updated_at ? new Date(st.updated_at).getTime() : Date.now(),
            description: st.description || '',
            url: '#',
            gateCode: Array.isArray(st.tags) && st.tags.length > 0 ? st.tags[0] : null,
            isRadzTask: assigneeName.toLowerCase().includes('radz'),
            attachments: st.attachments || [],
          };
        });

        // Supabase tasks overwrite clickup tasks if id matches, otherwise prepend
        const supaMap = new Map<string, ClickUpTask>(supaMapped.map((t) => [t.id, t]));
        tasks = [
          ...supaMapped,
          ...tasks.filter((t) => !supaMap.has(t.id)),
        ];
      }
    } catch (dbErr) {
      console.error('Error fetching Supabase tasks in /api/clickup/tasks:', dbErr);
    }

    // 3. Client Filter
    if (clientFilter && clientFilter !== 'all') {
      const clientKeyMap: Record<string, string> = {
        'we-rock-the-spectrum': 'we rock the spectrum',
        'wrts': 'we rock the spectrum',
        'juvibolt-cybertech': 'juvibolt',
        'aaron-ofosu': 'juvibolt',
        'risewise': 'risewise',
        'noirlab': 'noirlab',
        'studio-nets': 'studio nets',
        'invogue-cleans': 'invogue cleans',
        'tch2thrive': 'tch2thrive',
        'gim-internal': 'grace in motion',
      };
      const queryKey = clientKeyMap[clientFilter] || clientFilter.toLowerCase();
      tasks = tasks.filter((t) =>
        t.client.toLowerCase().includes(queryKey) ||
        t.listName.toLowerCase().includes(queryKey)
      );
    }

    // 4. Status Filter
    if (statusFilter && statusFilter !== 'all') {
      const sf = statusFilter.toLowerCase();
      tasks = tasks.filter((t) => {
        const s = t.status.toLowerCase();
        if (sf === 'for review' || sf === 'in review') {
          return s.includes('review');
        }
        if (sf === 'closed' || sf === 'done') {
          return s === 'closed' || s === 'done' || s === 'approved';
        }
        if (sf === 'in progress') {
          return s.includes('progress');
        }
        return s === sf;
      });
    }

    // 5. Assignee Filter
    if (assigneeFilter && assigneeFilter !== 'all') {
      const af = assigneeFilter.toLowerCase();
      tasks = tasks.filter((t) =>
        t.assignees.some((a) =>
          a.username.toLowerCase().includes(af) ||
          af.includes(a.username.toLowerCase()) ||
          (a.email && a.email.toLowerCase().includes(af))
        )
      );
    }

    // 6. Search Filter
    if (search) {
      tasks = tasks.filter(
        (t) =>
          t.name.toLowerCase().includes(search) ||
          t.id.toLowerCase().includes(search) ||
          (t.gateCode && t.gateCode.toLowerCase().includes(search)) ||
          t.assignees.some((a) => a.username.toLowerCase().includes(search)) ||
          t.client.toLowerCase().includes(search)
      );
    }

    // Dynamic stats computation
    const stats = {
      totalTasks: tasks.length,
      openCount: tasks.filter((t) => t.statusType === 'open' || t.status.toLowerCase() === 'to do' || t.status.toLowerCase() === 'open').length,
      inProgressCount: tasks.filter((t) => t.status.toLowerCase().includes('progress')).length,
      reviewCount: tasks.filter((t) => t.status.toLowerCase().includes('review')).length,
      closedCount: tasks.filter((t) => t.statusType === 'closed' || t.status.toLowerCase() === 'closed' || t.status.toLowerCase() === 'done' || t.status.toLowerCase() === 'approved').length,
      blockedCount: tasks.filter((t) => t.status.toLowerCase().includes('block')).length,
    };

    return NextResponse.json({
      success: true,
      data: {
        tasks,
        total: tasks.length,
        stats,
        lastSynced: data.lastSynced,
      },
    });
  } catch (error: any) {
    console.error('Failed to query ClickUp tasks:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch ClickUp tasks',
      },
      { status: 500 }
    );
  }
}

/**
 * Reject any write/mutation methods with 405 Method Not Allowed.
 * Enforces ClickUp 100% READ-ONLY rule.
 */
export async function POST() {
  return NextResponse.json(
    { error: 'ClickUp is strictly READ-ONLY. Mutations are prohibited.' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'ClickUp is strictly READ-ONLY. Mutations are prohibited.' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'ClickUp is strictly READ-ONLY. Mutations are prohibited.' },
    { status: 405 }
  );
}
