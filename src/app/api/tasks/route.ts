import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { fetchClickUpTasks } from '@/lib/clickup/client';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const clientParam = req.nextUrl.searchParams.get('client');
    const supabase = createAdminClient();

    // 1. Fetch Supabase tasks
    let query = supabase.from('client_tasks').select('*').order('due_date', { ascending: true });

    const allowedClientList = clientParam && clientParam !== 'all'
      ? clientParam.split(',').map((s) => s.trim().toLowerCase())
      : null;

    const { data: supaTasks, error } = await query;
    if (error) {
      console.error('Supabase tasks error:', error.message);
    }

    let supaList = supaTasks || [];
    if (allowedClientList && allowedClientList.length > 0) {
      supaList = supaList.filter((st: any) => {
        const c = (st.client || '').toLowerCase();
        return allowedClientList.some((allowed) => c.includes(allowed) || allowed.includes(c));
      });
    }

    // 2. Fetch ClickUp tasks (Read-only live sync)
    let clickupTasks: any[] = [];
    try {
      const clickupData = await fetchClickUpTasks();
      if (clickupData && clickupData.tasks) {
        clickupTasks = clickupData.tasks
          .filter((t) => {
            if (!allowedClientList || allowedClientList.length === 0) return true;
            const clientName = t.client.toLowerCase();
            const listName = t.listName.toLowerCase();
            const taskName = t.name.toLowerCase();

            return allowedClientList.some((param) => {
              if (clientName.includes(param) || param.includes(clientName) || listName.includes(param)) {
                return true;
              }

              // Keyword aliases
              if (param.includes('little treasures') && (clientName.includes('little') || listName.includes('little'))) return true;
              if (param.includes('spectrum') && (clientName.includes('spectrum') || taskName.includes('spectrum') || taskName.includes('wrts'))) return true;
              if (param.includes('studio nets') && (clientName.includes('nets') || taskName.includes('nets'))) return true;
              if (param.includes('invogue') && (clientName.includes('invogue') || taskName.includes('invogue'))) return true;
              if (param.includes('ofosu') && (clientName.includes('ofosu') || taskName.includes('ofosu'))) return true;
              if (param.includes('thrive') && (clientName.includes('thrive') || taskName.includes('thrive'))) return true;
              if (param.includes('internal') && (clientName.includes('internal') || listName.includes('grace in motion'))) return true;

              return false;
            });
          })
          .map((t) => {
            // Map ClickUp status to GIM pipeline
            let mappedStatus = 'To Do';
            const s = (t.status || '').toLowerCase();
            if (s === 'closed' || s === 'done' || t.statusType === 'closed') {
              mappedStatus = 'Closed';
            } else if (s === 'for review' || s === 'in review' || s === 'review') {
              mappedStatus = 'In Review';
            } else if (s === 'in progress') {
              mappedStatus = 'In Progress';
            } else if (s === 'approved') {
              mappedStatus = 'Approved';
            }

            // Map Priority
            let mappedPriority = 'Normal';
            const p = (t.priority || '').toLowerCase();
            if (p === 'urgent' || (t.gateCode && ['G18', 'G5'].includes(t.gateCode))) {
              mappedPriority = 'Urgent';
            } else if (p === 'high' || (t.gateCode && ['G7', 'G11'].includes(t.gateCode))) {
              mappedPriority = 'High';
            }

            return {
              id: t.id,
              title: t.name,
              client: t.client,
              description: t.description || '',
              status: mappedStatus,
              priority: mappedPriority,
              due_date: t.dueDate ? new Date(t.dueDate).toISOString() : null,
              assignee_name: t.assignees?.[0]?.username || 'Unassigned',
              assignee_id: t.assignees?.[0]?.id ? String(t.assignees[0].id) : '',
              created_by: 'ClickUp Mirror',
              attachments: t.attachments || [],
              tags: t.gateCode ? [t.gateCode] : [],
              url: t.url,
              created_at: t.dateCreated ? new Date(t.dateCreated).toISOString() : new Date().toISOString(),
              is_clickup: true,
            };
          });
      }
    } catch (cuErr) {
      console.error('ClickUp live fetch error:', cuErr);
    }

    // 3. Merge: Supabase task status/edits take precedence if ID matches
    const supaIds = new Set(supaList.map((t: any) => t.id));
    const merged = [
      ...supaList,
      ...clickupTasks.filter((ct) => !supaIds.has(ct.id)),
    ];

    return NextResponse.json({ tasks: merged });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      client,
      description = '',
      status = 'To Do',
      priority = 'Normal',
      due_date,
      assignee_name = 'Unassigned',
      assignee_id = '',
      created_by = 'Radzdom Gallego',
      attachments = [],
      tags = [],
    } = body;

    if (!title || !client) {
      return NextResponse.json({ error: 'title and client are required.' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: task, error } = await supabase
      .from('client_tasks')
      .insert({
        title: title.trim(),
        client: client.trim(),
        description: description.trim(),
        status,
        priority,
        due_date: due_date || null,
        assignee_name,
        assignee_id,
        created_by,
        attachments,
        tags,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, task });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, priority, due_date, description, title } = body;

    if (!id) {
      return NextResponse.json({ error: 'id is required.' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (status) updates.status = status;
    if (priority) updates.priority = priority;
    if (due_date !== undefined) updates.due_date = due_date;
    if (description !== undefined) updates.description = description;
    if (title) updates.title = title;

    // Check if task exists in Supabase
    const { data: existing } = await supabase.from('client_tasks').select('id').eq('id', id).maybeSingle();

    let taskData: any = null;
    if (existing) {
      const { data: task, error } = await supabase
        .from('client_tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      taskData = task;
    } else {
      // Upsert ClickUp mirrored task into Supabase so overrides persist
      const { data: task, error } = await supabase
        .from('client_tasks')
        .insert({
          id,
          title: title || 'Task',
          client: body.client || 'Little Treasures Company',
          status: status || 'To Do',
          priority: priority || 'Normal',
          due_date: due_date || null,
          description: description || '',
          assignee_name: body.assignee_name || 'Unassigned',
          assignee_id: body.assignee_id || '',
          created_by: 'GIM Dashboard',
        })
        .select()
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      taskData = task;
    }

    return NextResponse.json({ success: true, task: taskData });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
