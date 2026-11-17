import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { HierarchicalTask } from "@/lib/hierarchy/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const listId = req.nextUrl.searchParams.get("list_id");
    const spaceId = req.nextUrl.searchParams.get("space_id");
    const assigneeId = req.nextUrl.searchParams.get("assignee_id");
    const myTasks = req.nextUrl.searchParams.get("my_tasks") === "true";
    const statusParam = req.nextUrl.searchParams.get("status");

    const supabase = createAdminClient();

    // 1. Check if tasks table exists and query
    let query = supabase
      .from("tasks")
      .select(`
        id,
        list_id,
        parent_task_id,
        title,
        description,
        status,
        priority,
        creator_id,
        start_date,
        due_date,
        time_estimate_minutes,
        time_spent_minutes,
        tags,
        custom_fields,
        position,
        created_at,
        updated_at,
        task_assignees (
          id,
          user_id
        ),
        checklists (
          id,
          name,
          position,
          checklist_items (
            id,
            title,
            is_completed,
            assignee_id,
            due_date,
            position,
            completed_at
          )
        )
      `)
      .order("position", { ascending: true });

    if (listId) {
      query = query.eq("list_id", listId);
    }
    if (statusParam) {
      query = query.eq("status", statusParam);
    }

    const { data: dbTasks, error } = await query;

    if (!error && dbTasks && dbTasks.length > 0) {
      // Build parent-subtask tree
      const taskMap = new Map<string, any>();
      const rootTasks: HierarchicalTask[] = [];

      dbTasks.forEach((t: any) => {
        taskMap.set(t.id, {
          ...t,
          subtasks: [],
          subtasks_count: 0,
          subtasks_completed_count: 0,
          checklists: t.checklists || [],
        });
      });

      dbTasks.forEach((t: any) => {
        const item = taskMap.get(t.id);
        if (t.parent_task_id && taskMap.has(t.parent_task_id)) {
          const parent = taskMap.get(t.parent_task_id);
          parent.subtasks.push(item);
          parent.subtasks_count += 1;
          if (item.status.toLowerCase() === "completed" || item.status.toLowerCase() === "closed") {
            parent.subtasks_completed_count += 1;
          }
        } else {
          rootTasks.push(item);
        }
      });

      return NextResponse.json({ success: true, tasks: rootTasks, source: "database" });
    }

    // 2. Fallback: Query existing client_tasks to maintain 100% backward compatibility
    const { data: clientTasks } = await supabase
      .from("client_tasks")
      .select("*")
      .order("due_date", { ascending: true });

    const mappedTasks: HierarchicalTask[] = (clientTasks || []).map((ct: any) => ({
      id: ct.id,
      list_id: listId || "list-juvibolt",
      title: ct.title,
      description: ct.description,
      status: ct.status,
      priority: (ct.priority as any) || "Normal",
      due_date: ct.due_date,
      tags: ct.tags || [],
      position: 0,
      assignees: ct.assignee_id
        ? [
            {
              id: ct.assignee_id,
              user_id: ct.assignee_id,
              name: ct.assignee_name || "Specialist",
              nickname: ct.assignee_name || "Specialist",
            },
          ]
        : [],
      subtasks: [],
      subtasks_count: 0,
      checklists: [],
      created_at: ct.created_at,
    }));

    return NextResponse.json({ success: true, tasks: mappedTasks, source: "client_tasks_mirror" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      list_id,
      parent_task_id,
      title,
      description = "",
      status = "To Do",
      priority = "Normal",
      start_date,
      due_date,
      assignee_ids = [],
      tags = [],
      custom_fields = {},
    } = body;

    if (!title || !list_id) {
      return NextResponse.json({ error: "title and list_id are required." }, { status: 400 });
    }

    const supabase = createAdminClient();

    // 1. Insert into tasks table
    const { data: task, error } = await supabase
      .from("tasks")
      .insert({
        list_id,
        parent_task_id: parent_task_id || null,
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        start_date: start_date || null,
        due_date: due_date || null,
        tags,
        custom_fields,
      })
      .select()
      .single();

    if (error) {
      // Fallback: If tasks table migration not yet applied in remote Supabase, insert into client_tasks
      const { data: fallbackTask, error: fbError } = await supabase
        .from("client_tasks")
        .insert({
          title: title.trim(),
          client: "Operations",
          description: description.trim(),
          status,
          priority,
          due_date: due_date || null,
          tags,
        })
        .select()
        .single();

      if (fbError) {
        return NextResponse.json({ error: fbError.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, task: fallbackTask, source: "fallback_client_tasks" });
    }

    // 2. Insert assignees if provided
    if (assignee_ids && assignee_ids.length > 0) {
      const assigneeRows = assignee_ids.map((uid: string) => ({
        task_id: task.id,
        user_id: uid,
      }));
      await supabase.from("task_assignees").insert(assigneeRows);
    }

    // 3. Log task activity
    await supabase.from("task_activity_logs").insert({
      task_id: task.id,
      action: parent_task_id ? "subtask_created" : "task_created",
      details: { title: task.title, status: task.status, priority: task.priority },
    });

    return NextResponse.json({ success: true, task });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, priority, due_date, start_date, title, description, time_spent_minutes } = body;

    if (!id) {
      return NextResponse.json({ error: "id is required." }, { status: 400 });
    }

    const supabase = createAdminClient();
    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (status !== undefined) updates.status = status;
    if (priority !== undefined) updates.priority = priority;
    if (due_date !== undefined) updates.due_date = due_date;
    if (start_date !== undefined) updates.start_date = start_date;
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (time_spent_minutes !== undefined) updates.time_spent_minutes = time_spent_minutes;

    // Try updating in tasks
    const { data: task, error } = await supabase
      .from("tasks")
      .update(updates)
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error || !task) {
      // Fallback update in client_tasks
      const { data: fbTask } = await supabase
        .from("client_tasks")
        .update(updates)
        .eq("id", id)
        .select()
        .maybeSingle();

      return NextResponse.json({ success: true, task: fbTask, source: "client_tasks_mirror" });
    }

    // Log status change activity
    if (status !== undefined) {
      await supabase.from("task_activity_logs").insert({
        task_id: id,
        action: "status_changed",
        details: { new_status: status },
      });
    }

    return NextResponse.json({ success: true, task });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
