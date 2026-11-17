import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { createAdminClient } from "@/lib/supabase/admin";
import { HierarchicalTask } from "@/lib/hierarchy/types";

export const dynamic = "force-dynamic";

// Read authentic ClickUp tasks dataset
function getMasterClickUpTasks(): HierarchicalTask[] {
  try {
    const masterPath = path.join(process.cwd(), "src", "lib", "hierarchy", "clickup_tasks_master.json");
    if (fs.existsSync(masterPath)) {
      const content = fs.readFileSync(masterPath, "utf-8");
      return JSON.parse(content);
    }
  } catch (err) {
    console.warn("Could not read clickup_tasks_master.json:", err);
  }
  return [];
}

export async function GET(req: NextRequest) {
  try {
    const listId = req.nextUrl.searchParams.get("list_id");
    const spaceId = req.nextUrl.searchParams.get("space_id");
    const folderId = req.nextUrl.searchParams.get("folder_id");
    const assigneeParam = (req.nextUrl.searchParams.get("assignee_id") || "").toLowerCase();
    const myTasks = req.nextUrl.searchParams.get("my_tasks") === "true";
    const statusParam = (req.nextUrl.searchParams.get("status") || "").toLowerCase();
    const searchParam = (req.nextUrl.searchParams.get("search") || "").toLowerCase();
    const clientScopeParam = req.nextUrl.searchParams.get("client_scope");
    const isCoreAdminParam = req.nextUrl.searchParams.get("is_core_admin") === "true";

    // 1. Load authentic ClickUp tasks
    let allMasterTasks = getMasterClickUpTasks();

    let filtered = allMasterTasks;

    // Strict Client Isolation for non-admin specialists (if client_scope is provided)
    if (!isCoreAdminParam && clientScopeParam && clientScopeParam !== "all" && !myTasks) {
      const scopes = clientScopeParam.split(",").map((s) => s.trim().toLowerCase());
      filtered = filtered.filter((t) => {
        // Always include tasks assigned to the current user
        if (
          assigneeParam &&
          (t.assignees || []).some(
            (a) =>
              (a.name || "").toLowerCase().includes(assigneeParam) ||
              (a.nickname || "").toLowerCase().includes(assigneeParam) ||
              assigneeParam.includes((a.name || "").toLowerCase())
          )
        ) {
          return true;
        }

        const tFolder = (t.folder_name || "").toLowerCase();
        const tList = (t.list_name || "").toLowerCase();
        const tSpace = (t.space_name || "").toLowerCase();

        return scopes.some((sc) => {
          if (sc.includes("spectrum") && (tFolder.includes("spectrum") || tList.includes("spectrum") || tList.includes("wrts"))) return true;
          if (sc.includes("juvibolt") && (tFolder.includes("juvibolt") || tList.includes("juvibolt") || tList.includes("ofosu"))) return true;
          if (sc.includes("risewise") && (tFolder.includes("risewise") || tList.includes("risewise"))) return true;
          if (sc.includes("noirlab") && (tFolder.includes("noirlab") || tList.includes("noirlab"))) return true;
          if (sc.includes("studio net") && (tFolder.includes("studio net") || tList.includes("studio net"))) return true;
          if (sc.includes("invogue") && (tFolder.includes("invogue") || tList.includes("invogue"))) return true;
          if (sc.includes("tch2thrive") && (tFolder.includes("tch2thrive") || tList.includes("tch2thrive"))) return true;
          if (sc.includes("motion") || sc.includes("internal")) return tSpace.includes("operations") || tFolder.includes("gim") || tList.includes("grace");
          return tFolder.includes(sc) || tList.includes(sc);
        });
      });
    }

    // Filter by My Tasks
    if (myTasks) {
      filtered = filtered.filter((t) => {
        if (!assigneeParam) return true;
        return (t.assignees || []).some((a) => {
          const name = (a.name || "").toLowerCase();
          const nick = (a.nickname || "").toLowerCase();
          return (
            name.includes(assigneeParam) ||
            assigneeParam.includes(name) ||
            nick.includes(assigneeParam) ||
            (assigneeParam.includes("radz") && (name.includes("radz") || nick.includes("radz"))) ||
            (assigneeParam.includes("divine") && (name.includes("divine") || nick.includes("divine")))
          );
        });
      });
    } else if (listId) {
      filtered = filtered.filter(
        (t) => t.list_id === listId || (t.list_name && t.list_name.toLowerCase().includes(listId.replace("list-", "").replace(/-/g, " ")))
      );
    } else if (folderId) {
      filtered = filtered.filter((t) => t.folder_id === folderId);
    } else if (spaceId) {
      filtered = filtered.filter((t) => t.space_id === spaceId);
    }

    // Status filter
    if (statusParam) {
      filtered = filtered.filter((t) => (t.status || "").toLowerCase() === statusParam);
    }

    // Search filter
    if (searchParam) {
      filtered = filtered.filter(
        (t) =>
          (t.title || "").toLowerCase().includes(searchParam) ||
          (t.description || "").toLowerCase().includes(searchParam)
      );
    }

    // If master tasks exist, return them!
    if (filtered.length > 0) {
      return NextResponse.json({
        success: true,
        tasks: filtered,
        total: filtered.length,
        source: "authentic_clickup_master",
      });
    }

    // Fallback: Query Supabase
    const supabase = createAdminClient();
    const { data: clientTasks } = await supabase
      .from("client_tasks")
      .select("*")
      .order("due_date", { ascending: true });

    const mappedTasks: HierarchicalTask[] = (clientTasks || []).map((ct: any) => ({
      id: ct.id,
      list_id: listId || "list-grace-in-motion",
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
