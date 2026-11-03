import { ClickUpTask, ClickUpStats, ClickUpAssignee } from './types';

const BASE_URL = 'https://api.clickup.com/api/v2';

interface RawClickUpTask {
  id: string;
  name: string;
  status: {
    status: string;
    color: string;
    type: 'open' | 'custom' | 'done' | 'closed';
  };
  priority?: {
    priority: string;
    color: string;
  } | null;
  assignees?: {
    id: number;
    username: string;
    email: string;
    color: string;
    initials: string;
    profilePicture?: string | null;
  }[];
  due_date?: string | number | null;
  start_date?: string | number | null;
  date_created?: string | number | null;
  date_updated?: string | number | null;
  description?: string;
  url?: string;
  list?: {
    id: string;
    name: string;
  };
}

function extractGateCode(name: string): string | null {
  const match = name.match(/^(G\d+)\s*\|/i);
  return match ? match[1].toUpperCase() : null;
}

function formatEpochDate(epochMs?: string | number | null): string | null {
  if (!epochMs) return null;
  try {
    const num = typeof epochMs === 'string' ? parseInt(epochMs, 10) : epochMs;
    if (isNaN(num)) return null;
    const date = new Date(num);
    return date.toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return null;
  }
}

function normalizeTask(raw: RawClickUpTask, clientName: string, listId: string, listName: string): ClickUpTask {
  const assignees: ClickUpAssignee[] = (raw.assignees || []).map((a) => ({
    id: a.id,
    username: a.username,
    email: a.email,
    color: a.color || '#466B53',
    initials: a.initials || a.username.slice(0, 2).toUpperCase(),
    avatar: a.profilePicture || null,
  }));

  const isRadzTask = assignees.some(
    (a) =>
      a.username.toLowerCase().includes('radz') ||
      a.email.toLowerCase().includes('radzdom')
  );

  const dueDateNum = raw.due_date ? parseInt(String(raw.due_date), 10) : null;
  const startDateNum = raw.start_date ? parseInt(String(raw.start_date), 10) : null;
  const createdNum = raw.date_created ? parseInt(String(raw.date_created), 10) : null;
  const updatedNum = raw.date_updated ? parseInt(String(raw.date_updated), 10) : null;

  return {
    id: raw.id,
    name: raw.name,
    status: raw.status?.status?.toLowerCase() || 'to do',
    statusColor: raw.status?.color || '#87909e',
    statusType: raw.status?.type || 'open',
    priority: raw.priority?.priority || null,
    priorityColor: raw.priority?.color || null,
    listId,
    listName: raw.list?.name || listName,
    client: clientName,
    assignees,
    dueDate: dueDateNum,
    dueDateFormatted: formatEpochDate(dueDateNum),
    startDate: startDateNum,
    dateCreated: createdNum,
    dateUpdated: updatedNum,
    description: raw.description || '',
    url: raw.url || `https://app.clickup.com/t/${raw.id}`,
    gateCode: extractGateCode(raw.name),
    isRadzTask,
  };
}

/**
 * Server-side read-only fetcher for ClickUp tasks.
 * STRICTLY READ-ONLY (GET requests only).
 */
export async function fetchClickUpTasks(): Promise<{
  tasks: ClickUpTask[];
  stats: ClickUpStats;
  lastSynced: string;
}> {
  const token = process.env.CLICKUP_API_TOKEN || 'pk_106916383_IE6ZH7P1316N9K34ZN65RBXJURJ9FMDD';
  const listLittleTreasures = process.env.CLICKUP_LIST_LITTLE_TREASURES || '1301240000003883';
  const listGim = process.env.CLICKUP_LIST_GIM_INTERNAL || '901607479883';

  const headers = {
    Authorization: token,
    'Content-Type': 'application/json',
  };

  const allTasks: ClickUpTask[] = [];

  // 1. Fetch Little Treasures List (Client Delivery Backlog)
  try {
    const resLT = await fetch(
      `${BASE_URL}/list/${listLittleTreasures}/task?include_closed=true&subtasks=true`,
      {
        headers,
        next: { revalidate: 60 }, // Cache for 60 seconds
      }
    );

    if (resLT.ok) {
      const data = await resLT.json();
      const rawTasks: RawClickUpTask[] = data.tasks || [];
      rawTasks.forEach((raw) => {
        allTasks.push(normalizeTask(raw, 'Little Treasures Company', listLittleTreasures, 'Little Treasures'));
      });
    }
  } catch (err) {
    console.error('Error fetching ClickUp Little Treasures tasks:', err);
  }

  // 2. Fetch GIM Internal List
  try {
    const resGIM = await fetch(
      `${BASE_URL}/list/${listGim}/task?include_closed=true&subtasks=true`,
      {
        headers,
        next: { revalidate: 60 },
      }
    );

    if (resGIM.ok) {
      const data = await resGIM.json();
      const rawTasks: RawClickUpTask[] = data.tasks || [];
      rawTasks.forEach((raw) => {
        allTasks.push(normalizeTask(raw, 'Grace In Motion (Internal)', listGim, 'Grace In Motion'));
      });
    }
  } catch (err) {
    console.error('Error fetching ClickUp GIM Internal tasks:', err);
  }

  // Sort: Tasks needing review first, then in progress, then to do, then closed
  const statusRank: Record<string, number> = {
    'for review': 1,
    'in progress': 2,
    'blocked': 3,
    'to do': 4,
    'open': 5,
    'closed': 6,
  };

  allTasks.sort((a, b) => {
    const rankA = statusRank[a.status] || 99;
    const rankB = statusRank[b.status] || 99;
    if (rankA !== rankB) return rankA - rankB;
    return (b.dateUpdated || 0) - (a.dateUpdated || 0);
  });

  const stats: ClickUpStats = {
    totalTasks: allTasks.length,
    openCount: allTasks.filter((t) => t.status === 'to do' || t.status === 'open').length,
    inProgressCount: allTasks.filter((t) => t.status === 'in progress').length,
    reviewCount: allTasks.filter((t) => t.status === 'for review').length,
    closedCount: allTasks.filter((t) => t.status === 'closed').length,
    blockedCount: allTasks.filter((t) => t.status === 'blocked').length,
  };

  return {
    tasks: allTasks,
    stats,
    lastSynced: new Date().toISOString(),
  };
}
