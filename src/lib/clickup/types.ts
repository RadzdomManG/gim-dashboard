export interface ClickUpAssignee {
  id: number;
  username: string;
  email: string;
  color: string;
  initials: string;
  avatar?: string | null;
}

export interface ClickUpTask {
  id: string;
  name: string;
  status: string;
  statusColor: string;
  statusType: 'open' | 'custom' | 'done' | 'closed';
  priority?: string | null;
  priorityColor?: string | null;
  listId: string;
  listName: string;
  client: string;
  assignees: ClickUpAssignee[];
  dueDate?: number | null;
  dueDateFormatted?: string | null;
  startDate?: number | null;
  dateCreated?: number | null;
  dateUpdated?: number | null;
  description?: string;
  url: string;
  gateCode?: string | null; // e.g. "G5", "G7", "G18"
  isRadzTask?: boolean;
}

export interface ClickUpStats {
  totalTasks: number;
  openCount: number;
  inProgressCount: number;
  reviewCount: number;
  closedCount: number;
  blockedCount: number;
}
