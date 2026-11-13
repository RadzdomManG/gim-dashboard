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
  attachments?: {
    id: string;
    title: string;
    url: string;
    size?: number;
    mimetype?: string;
  }[];
  list?: {
    id: string;
    name: string;
  };
}

export const CLICKUP_LISTS: { id: string; client: string; listName: string }[] = [
  { id: '1301240000002387', client: 'We Rock the Spectrum (WRTS)', listName: 'We Rock the Spectrum' },
  { id: '1301240000005206', client: 'Juvibolt Cybertech', listName: 'Juvibolt Cybertech' },
  { id: '901617666653', client: 'InVogue Cleans', listName: 'InVogue Cleans' },
  { id: '901616453524', client: 'NoirLab', listName: 'NoirLab' },
  { id: '901616174910', client: 'Studio Nets', listName: 'Studio Nets' },
  { id: '901614119824', client: 'Risewise', listName: 'Risewise' },
  { id: '901607479883', client: 'Grace In Motion (Internal)', listName: 'Grace In Motion' },
  { id: '901605140683', client: 'Origines Biz', listName: 'Origines Biz' },
];

function extractGateCode(name: string): string | null {
  const match =
    name.match(/^([A-Z]\d+(\.\d+)?)\s*\|/i) ||
    name.match(/^(W\d+)\s*\|/i) ||
    name.match(/^(G\d+)/i) ||
    name.match(/^(J\d+)/i) ||
    name.match(/^(T\d+(\.\d+)?)/i);
  return match ? match[1].toUpperCase() : null;
}

export function detectClient(raw: RawClickUpTask): string {
  const listId = String(raw.list?.id || '');
  const listName = (raw.list?.name || '').trim().toLowerCase();

  if (listId === '1301240000003883' || listName === 'little treasures') return 'Little Treasures Company';
  if (listId === '1301240000002387' || listName === 'we rock the spectrum') return 'We Rock the Spectrum (WRTS)';
  if (listId === '1301240000005206' || listName === 'juvibolt cybertech') return 'Juvibolt Cybertech';
  if (listId === '901617666653' || listName === 'invogue cleans') return 'InVogue Cleans';
  if (listId === '901616453524' || listName === 'noirlab') return 'NoirLab';
  if (listId === '901616174910' || listName === 'studio nets') return 'Studio Nets';
  if (listId === '901614119824' || listName === 'risewise') return 'Risewise';
  if (listId === '901607479883' || listName === 'grace in motion') return 'Grace In Motion (Internal)';
  if (listId === '901605140683' || listName === 'origines biz') return 'Origines Biz';

  return raw.list?.name || 'Grace In Motion (Internal)';
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

function normalizeTask(raw: RawClickUpTask, clientName?: string, listId?: string, listName?: string): ClickUpTask {
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

  const resolvedClient = clientName || detectClient(raw);
  const resolvedListId = listId || raw.list?.id || 'list-team';
  const resolvedListName = listName || raw.list?.name || resolvedClient;

  return {
    id: raw.id,
    name: raw.name,
    status: raw.status?.status?.toLowerCase() || 'to do',
    statusColor: raw.status?.color || '#87909e',
    statusType: raw.status?.type || 'open',
    priority: raw.priority?.priority || null,
    priorityColor: raw.priority?.color || null,
    listId: resolvedListId,
    listName: resolvedListName,
    client: resolvedClient,
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
    attachments: (raw.attachments || []).map((att) => ({
      id: att.id,
      name: att.title || 'Attachment',
      url: att.url,
      size: att.size ? `${(att.size / 1024).toFixed(0)} KB` : undefined,
      type: att.mimetype?.includes('image') ? 'image' : att.mimetype?.includes('video') ? 'video' : 'document',
    })),
  };
}

let cachedClickupData: {
  tasks: ClickUpTask[];
  stats: ClickUpStats;
  lastSynced: string;
} | null = null;
let lastCacheTime = 0;

/**
 * Server-side read-only fetcher for ClickUp tasks across each specific client list.
 * STRICTLY READ-ONLY (GET requests only).
 * Ensures ZERO cross-client drift — each task belongs strictly to its real list.
 */
export async function fetchClickUpTasks(): Promise<{
  tasks: ClickUpTask[];
  stats: ClickUpStats;
  lastSynced: string;
}> {
  // Return in-memory cached copy if fresh within 60 seconds
  if (cachedClickupData && Date.now() - lastCacheTime < 60000) {
    return cachedClickupData;
  }

  const token = process.env.CLICKUP_API_TOKEN || 'pk_270815645_M7Z1GM9GB02FN6KUCOXIJ2KHP37LN82G';
  const headers = {
    Authorization: token,
    'Content-Type': 'application/json',
  };

  const allRawTasks: ClickUpTask[] = [];

  // Query each client list directly in parallel
  const listPromises = CLICKUP_LISTS.map(async (item) => {
    try {
      const listTasks: ClickUpTask[] = [];
      let page = 0;
      // Fetch up to 3 pages per list (covers 300 tasks per list, 100% of open & active deliverables)
      while (page < 3) {
        const res = await fetch(
          `${BASE_URL}/list/${item.id}/task?include_closed=true&subtasks=true&page=${page}`,
          { headers, next: { revalidate: 60 } }
        );

        if (!res.ok) break;

        const data = await res.json();
        const rawBatch: RawClickUpTask[] = data.tasks || [];
        if (rawBatch.length === 0) break;

        rawBatch.forEach((raw) => {
          listTasks.push(normalizeTask(raw, item.client, item.id, item.listName));
        });

        if (rawBatch.length < 100) break;
        page++;
      }
      return listTasks;
    } catch (err) {
      console.error(`Error fetching list ${item.client} (${item.id}):`, err);
      return [];
    }
  });

  try {
    const results = await Promise.all(listPromises);
    results.forEach((tasks) => {
      allRawTasks.push(...tasks);
    });
  } catch (err) {
    console.error('Error in parallel ClickUp fetch:', err);
  }

  // Deduplicate by ID
  const seenIds = new Set<string>();
  const uniqueTasks: ClickUpTask[] = [];
  for (const t of allRawTasks) {
    if (!seenIds.has(t.id)) {
      seenIds.add(t.id);
      uniqueTasks.push(t);
    }
  }

  // Sort: Tasks needing review first, then in progress, then to do, then closed
  const statusRank: Record<string, number> = {
    'for review': 1,
    'in review': 1,
    'in progress': 2,
    'blocked': 3,
    'to do': 4,
    'open': 5,
    'closed': 6,
    'complete': 6,
  };

  uniqueTasks.sort((a, b) => {
    const rankA = statusRank[a.status] || 99;
    const rankB = statusRank[b.status] || 99;
    if (rankA !== rankB) return rankA - rankB;
    return (b.dateUpdated || 0) - (a.dateUpdated || 0);
  });

  const stats: ClickUpStats = {
    totalTasks: uniqueTasks.length,
    openCount: uniqueTasks.filter((t) => t.status === 'to do' || t.status === 'open').length,
    inProgressCount: uniqueTasks.filter((t) => t.status === 'in progress').length,
    reviewCount: uniqueTasks.filter((t) => t.status === 'for review' || t.status === 'in review').length,
    closedCount: uniqueTasks.filter((t) => t.status === 'closed' || t.status === 'complete' || t.statusType === 'closed').length,
    blockedCount: uniqueTasks.filter((t) => t.status === 'blocked').length,
  };

  const result = {
    tasks: uniqueTasks,
    stats,
    lastSynced: new Date().toISOString(),
  };

  cachedClickupData = result;
  lastCacheTime = Date.now();

  return result;
}
