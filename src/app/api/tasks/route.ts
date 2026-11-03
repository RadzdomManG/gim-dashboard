import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const clientParam = req.nextUrl.searchParams.get('client');
    const supabase = createAdminClient();

    let query = supabase.from('client_tasks').select('*').order('due_date', { ascending: true });

    if (clientParam && clientParam !== 'all') {
      query = query.ilike('client', `%${clientParam}%`);
    }

    const { data: tasks, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ tasks: tasks || [] });
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

    const { data: task, error } = await supabase
      .from('client_tasks')
      .update(updates)
      .eq('id', id)
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
