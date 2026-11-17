/**
 * GIM Agency OS — Project Management Hierarchy Types
 * ClickUp-Inspired 7-Tier Architecture:
 * Workspace -> Spaces -> Folders -> Lists -> Tasks -> Subtasks -> Checklists
 */

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  owner_id?: string | null;
  settings?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

export interface TaskStatusConfig {
  name: string;
  color: string;
  type: "open" | "todo" | "inprogress" | "review" | "approved" | "rejected" | "hold" | "closed" | "cancelled";
}

export interface Space {
  id: string;
  workspace_id: string;
  name: string;
  slug: string;
  icon?: string;
  color?: string;
  is_private: boolean;
  status_config: TaskStatusConfig[];
  position: number;
  folders?: Folder[];
  lists?: List[]; // Standalone lists directly under Space
  created_at?: string;
}

export interface Folder {
  id: string;
  space_id: string;
  name: string;
  color?: string;
  position: number;
  is_archived: boolean;
  lists?: List[];
  created_at?: string;
}

export interface List {
  id: string;
  space_id: string;
  folder_id?: string | null;
  name: string;
  description?: string;
  color?: string;
  status_config?: TaskStatusConfig[] | null;
  position: number;
  is_archived: boolean;
  tasks_count?: number;
  created_at?: string;
}

export interface ChecklistItem {
  id: string;
  checklist_id: string;
  title: string;
  is_completed: boolean;
  assignee_id?: string | null;
  assignee_name?: string | null;
  due_date?: string | null;
  position: number;
  completed_at?: string | null;
}

export interface Checklist {
  id: string;
  task_id: string;
  name: string;
  position: number;
  items: ChecklistItem[];
}

export interface TaskAssignee {
  id: string;
  user_id: string;
  name: string;
  nickname?: string;
  email?: string;
  avatar_color?: string;
}

export interface TaskDependency {
  id: string;
  task_id: string;
  depends_on_task_id: string;
  dependency_type: "waiting_on" | "blocking";
  target_task_title?: string;
  target_task_status?: string;
}

export interface HierarchicalTask {
  id: string;
  list_id: string;
  list_name?: string;
  folder_id?: string | null;
  folder_name?: string | null;
  space_id?: string;
  space_name?: string;
  parent_task_id?: string | null;
  title: string;
  description?: string;
  status: string;
  priority: "Urgent" | "High" | "Normal" | "Low";
  creator_id?: string | null;
  creator_name?: string | null;
  start_date?: string | null;
  due_date?: string | null;
  time_estimate_minutes?: number;
  time_spent_minutes?: number;
  tags?: string[];
  custom_fields?: Record<string, unknown>;
  position: number;
  is_archived?: boolean;
  assignees?: TaskAssignee[];
  subtasks?: HierarchicalTask[];
  subtasks_count?: number;
  subtasks_completed_count?: number;
  checklists?: Checklist[];
  dependencies?: TaskDependency[];
  comments_count?: number;
  created_at?: string;
  updated_at?: string;
}

export type PMViewMode = "list" | "board" | "calendar" | "gantt" | "timeline" | "my-tasks";
